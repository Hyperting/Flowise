import { TextSplitter } from 'langchain/text_splitter'
import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { JSONLoader } from 'langchain/document_loaders/fs/json'

class JsonVariable_DocumentLoaders implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs?: INodeParams[]

    constructor() {
        this.label = 'JSON Variable'
        this.name = 'jsonVariable'
        this.version = 1.0
        this.type = 'Document'
        this.icon = 'jsonvariable.svg'
        this.category = 'Document Loaders'
        this.description = `Load data from an input JSON`
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Input JSON',
                name: 'inputJson',
                description: 'Input ',
                type: 'json',
                optional: true,
                acceptVariable: true,
                list: true
            },
            {
                label: 'Text Splitter',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            }
        ]
    }
    async init(nodeData: INodeData): Promise<any> {
        const inputJsonRaw = nodeData.inputs?.inputJson
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const metadata = nodeData.inputs?.metadata

        // let inputVars: ICommonObject = {}
        // if (inputJsonRaw) {
        //     try {
        //         inputVars = typeof inputJsonRaw === 'object' ? inputJsonRaw : JSON.parse(inputJsonRaw)
        //     } catch (exception) {
        //         throw new Error('Invalid JSON in the Json Variable Input JSON: ' + exception)
        //     }
        // }

        // // Some values might be a stringified JSON, parse it
        // for (const key in inputVars) {
        //     let value = inputVars[key]
        //     if (typeof value === 'string') {
        //         value = handleEscapeCharacters(value, true)
        //         if (value.startsWith('{') && value.endsWith('}')) {
        //             try {
        //                 value = JSON.parse(value)
        //             } catch (e) {
        //                 // ignore
        //             }
        //         }
        //         inputVars[key] = value
        //     }
        // }

        const blob = new Blob([inputJsonRaw], { type: 'application/json' })

        const loader = new JSONLoader(blob)

        let docs = []

        if (textSplitter) {
            docs = await loader.loadAndSplit(textSplitter)
        } else {
            docs = await loader.load()
        }

        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata)
            let finaldocs = []
            for (const doc of docs) {
                const newdoc = {
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        ...parsedMetadata
                    }
                }
                finaldocs.push(newdoc)
            }
            return finaldocs
        }

        return docs
    }
}

module.exports = {
    nodeClass: JsonVariable_DocumentLoaders
}
