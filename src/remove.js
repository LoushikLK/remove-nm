import { rmdirSync, unlinkSync } from "fs";
import Spinner from "./loader.js";

const removeFolderRecursive = async (paths) => {
  await Promise.all(
    paths.map(async (path) => {
      return new Promise((resolve, reject) => {
        const spinner = new Spinner(`Removing ${path}`, index + 1);
        spinner.start();
        try {
          rmdirSync(path, { recursive: true });
          spinner.setText("Removed " + path + " ✔");
        } catch (error) {
          spinner.setText("Failed to remove " + path + " ❌");
        } finally {
          spinner.stop();
          resolve();
        }
      });
    })
  );
};

const removeFiles = async (paths) => {
  await Promise.all(
    paths.map(async (path, index) => {
      return new Promise((resolve, reject) => {
        const spinner = new Spinner(`removing ${path}`, index + 1);
        spinner.start();
        try {
          unlinkSync(path);
          spinner.setText("Removed " + path + " ✔");
        } catch (error) {
          spinner.setText("Failed to remove " + path + " ❌");
        } finally {
          spinner.stop();
          resolve();
        }
      });
    })
  );
};

export { removeFolderRecursive, removeFiles };
