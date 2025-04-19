import fs from "fs-extra"
import path from "path"

export class FileHandler {
  static readJsonFile(filePath: string): any {
    try {
      return fs.readJSONSync(filePath)
    } catch (error) {
      console.error("Error reading JSON file:", error)
      throw error
    }
  }

  static writeJsonFile(filePath: string, data: any): void {
    try {
      fs.ensureDirSync(path.dirname(filePath))
      fs.writeJSONSync(filePath, data, { spaces: 2 })
    } catch (error) {
      console.error("Error writing JSON file:", error)
      throw error
    }
  }

  static async translateJsonRecursively(jsonObject: any, translator: (text: string) => Promise<string>): Promise<any> {
    if (typeof jsonObject === "string") {
      return await translator(jsonObject)
    }

    if (Array.isArray(jsonObject)) {
      return Promise.all(jsonObject.map((item) => this.translateJsonRecursively(item, translator)))
    }

    if (typeof jsonObject === "object" && jsonObject !== null) {
      const translatedObject: any = {}
      for (const [key, value] of Object.entries(jsonObject)) {
        translatedObject[key] = await this.translateJsonRecursively(value, translator)
      }
      return translatedObject
    }

    return jsonObject
  }
}
