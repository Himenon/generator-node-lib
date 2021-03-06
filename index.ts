import * as Generator from 'yeoman-generator'
import * as _s from "underscore.string";
import * as ReadPkgUp from "read-pkg-up";

interface PromptResult {
  projectName: string;
  description: string;
  repositoryName: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
}

interface PromptQuestion extends Generator.Question {
  type?: "input" | "confirm" | "list" | "rawlist" | "password";
  name: keyof PromptResult;
}

export = class extends Generator {
  constructor(args: string|string[], options: {}) {
    super(args, options);
  }

  private _mv(from: string, to: string) {
    this.fs.move(this.destinationPath(from), this.destinationPath(to));
  }

  public async _prompting(): Promise<PromptResult> {
    const readResult = ReadPkgUp.sync({ normalize: false });
    const pkg = readResult ? readResult.package : {};
    const author = pkg.author;
    const inputAuthor = typeof author === "string" ? {
      name: author,
    } : {
      name: author && author.name,
      email: author && author.email,
      url: author && author.url,
    };
    const questions: PromptQuestion[] = [
      {
        type: "input",
        name: "projectName",
        message: "Your project name",
        default: pkg.name || _s.slugify(this.appname), // Default to current folder name
      },
      {
        type: "input",
        name: "description",
        message: "Project description",
        default: pkg.description,
      },
      {
        type: "input",
        name: "repositoryName",
        message: "Repository name",
        default: pkg.repository,
      },
      {
        type: "input",
        name: "authorName",
        message: "Author name",
        default: inputAuthor.name,
      },
      {
        type: "input",
        name: "authorEmail",
        message: "Author email",
        default: inputAuthor.email,
      },
      {
        type: "input",
        name: "authorUrl",
        message: "Profile url",
        default: inputAuthor.url,
      },
    ]
    return await this.prompt(questions) as PromptResult;
  }

  public async init() {
    const templateOptions = await this._prompting();
    this.fs.copyTpl(
      `${this.templatePath()}/**`,
      this.destinationPath(),
      templateOptions
    )
    const dotFiles = [
      "dependency-cruiser.json",
      "eslintrc.json",
      "gitignore",
      "huskyrc",
      "lintstagedrc",
      "npmrc",
      "npmrc.template",
      "prettierignore",
      "prettierrc",
      "travis.yml",
      "yarnrc",
    ]
    dotFiles.forEach(dotFile => this._mv(`_${dotFile}`, `.${dotFile}`));
    this._mv("_package.json", "package.json");
    this._mv("_README.md", "README.md");
    this._mv("_LICENSE", "LICENSE");
  }

  public install() {
    const devDependencyPackages = [
      "@commitlint/cli",
      "@commitlint/config-conventional",
      "@types/jest",
      "@types/node",
      "@typescript-eslint/eslint-plugin",
      "@typescript-eslint/eslint-plugin-tslint",
      "@typescript-eslint/parser",
      "codecov",
      "dependency-cruiser",
      "eslint",
      "generate-changelog",
      "husky",
      "jest",
      "jest-cli",
      "lint-staged",
      "prettier",
      "rimraf",
      "sort-package-json",
      "ts-jest",
      "ts-node",
      "tslint",
      "tslint-config-prettier",
      "tslint-config-standard",
      "tslint-plugin-prettier",
      "typescript",
    ];
    this.yarnInstall(devDependencyPackages, { dev: true })
  }
};
