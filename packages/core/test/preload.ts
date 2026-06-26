import path from "path"

process.env.BIGMANCODE_DB = ":memory:"
process.env.BIGMANCODE_MODELS_PATH = path.join(import.meta.dir, "plugin", "fixtures", "models-dev.json")
process.env.BIGMANCODE_DISABLE_MODELS_FETCH = "true"
