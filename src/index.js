#!/usr/bin/env node

"use strict";

import { existsSync, lstatSync, readdirSync } from "fs";
import gradient from "gradient-string";
import inquirer from "inquirer";
import path from "path";
import { removeFiles, removeFolderRecursive } from "./remove.js";

const printError = (error) => {
  console.error(gradient("#e31010", "#e31010")(error + "\n"));
};
const printSuccess = (success) => {
  console.log(gradient("#42f548", "#42f548")(success + "\n"));
};
const printInfo = (info) => {
  console.log(gradient("#42f5f5", "#42f5f5")(info + "\n"));
};
const printMultiline = (text) => {
  return gradient.pastel.multiline(text + "\n");
};

const currentDir = process.cwd();

const allArguments = process.argv;

const firstArgument = allArguments[2];
const secondArgument = allArguments[3];
const fileDeletingArguments =
  allArguments?.includes("-f") || allArguments?.includes("--files");
const ignoreFolder = allArguments
  ?.find((arg) => arg.includes("-i="))
  ?.split("=")[1];

if (!firstArgument)
  console.error("Type npx rm-node-modules -h or --help for help");

if (firstArgument === "-h" || firstArgument === "--help") {
  printInfo("Usage: npx rm-node-modules <directory> [regex] [flags]");
  printInfo(`Example: npx rm-node-modules ${currentDir} node_modules`);
  printInfo(
    "Flags: -h, --help, -f, --files, -i=<folder,folder>, --ignore=<folder,folder> (ignore folders)"
  );
  process.exit(0);
}

const currentPath = path.join(currentDir, firstArgument);

// Check if the directory exists
if (!existsSync(currentPath)) {
  printError(`Directory ${firstArgument} does not exist`);
  process.exit(1);
}

if (!lstatSync(currentPath).isDirectory()) {
  printError(`Directory ${firstArgument} is not a directory`);
  process.exit(1);
}

const deleteRegex = new RegExp(
  secondArgument ? secondArgument : "node_modules"
);

const directoryToRemoveList = [];
const filesToRemoveList = [];

//Look for deleting directories
const findRemovableDirectoriesAndFiles = (dir) => {
  readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
    try {
      const matchRegex = deleteRegex.test(dirent.name);
      const ignoreRegex = new RegExp(dirent.name).test(ignoreFolder);
      if (dirent.isDirectory() && !ignoreRegex) {
        if (matchRegex && !fileDeletingArguments) {
          directoryToRemoveList.push(path.join(dir, dirent.name));
        }
        if (fileDeletingArguments) {
          findRemovableDirectoriesAndFiles(path.join(dir, dirent.name));
        }
        if (!matchRegex && !fileDeletingArguments) {
          findRemovableDirectoriesAndFiles(path.join(dir, dirent.name));
        }
      }
      if (
        dirent.isFile() &&
        matchRegex &&
        fileDeletingArguments &&
        !ignoreRegex
      ) {
        filesToRemoveList.push(path.join(dir, dirent.name));
      }
    } catch (error) {
      printInfo("Ignored " + dirent.name);
    }
  });
};
findRemovableDirectoriesAndFiles(currentPath);

if (fileDeletingArguments && filesToRemoveList.length === 0) {
  printError("No files to delete");
  process.exit(1);
}

if (!fileDeletingArguments && directoryToRemoveList.length === 0) {
  printError("No directories to delete");
  process.exit(1);
}

const userConfirmation = [];

const questionName = "Confirm your choice";

const chooseUserAnswer = async () => {
  const answer = await inquirer.prompt({
    name: questionName,
    type: "list",
    choices: ["All", "Custom", "Cancel"],
  });

  if (answer[questionName] === "All") {
    userConfirmation.push("All");
  }

  if (answer[questionName] === "Cancel") {
    printInfo("Operation canceled");
    process.exit(0);
  }

  if (answer[questionName] === "Custom") {
    const fileOrDirectoryList = fileDeletingArguments
      ? filesToRemoveList
      : directoryToRemoveList;

    const answer = await inquirer.prompt({
      name: questionName,
      type: "checkbox",
      choices: fileOrDirectoryList.map((dir) => {
        return {
          name: dir,
          value: dir,
        };
      }),
    });
    userConfirmation.push(...answer[questionName]);
  }
};

await chooseUserAnswer();

const programmeStartTime = Date.now();

process.on("exit", () => {
  const time = (Date.now() - programmeStartTime) / 1000;
  printSuccess(`Operation completed in ${time} seconds`);
});

if (userConfirmation.includes("All")) {
  if (!fileDeletingArguments) {
    await removeFolderRecursive(directoryToRemoveList);
  }

  if (fileDeletingArguments) {
    await removeFiles(filesToRemoveList);
  }
  printSuccess("Operation completed");
  process.exit(0);
}

console.log("userConfirmation", userConfirmation);

if (!fileDeletingArguments) {
  await removeFolderRecursive(userConfirmation);
}

if (fileDeletingArguments) {
  await removeFiles(userConfirmation);
}
