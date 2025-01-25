import OpenAI from "openai"
export default async function DeleteAllFiles(){
    const openai = new OpenAI()
    const files = await openai.files.list()
    files.data.map((file) => {
        openai.files.del(file.id)
    })
}