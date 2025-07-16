import { ask, downloads } from "./helper"
import Scraper from "./scraper"
import Server from "./server"
import Storage from "./storage"

const ServerOptions = {
   apiURL: "",
   apiKey: "",
   authorId: 1
}

const ScraperOptions = {
   webName: "",
   apiURL: "",
   apiKey: "",
}

const StorageOptions = {
   storageUrl: "",
   endpoint: "",
   accessKey: "",
   secretKey: "",
   bucket: "",
   region: "",
   root: ""
}

const server = new Server(ServerOptions)
const scraper = new Scraper(ScraperOptions)
const storage = new Storage(StorageOptions)

while (true) {
   const input = await ask("Input series URL or 1 to exit: ")
   if (input === "1") break

   const slug = input.split("/")[4]
   if (!slug) {
      console.log(`Invalid URL: ${input}`)
      continue
   }

   console.log(`Submitted URL: ${input}`)
   try {
      const series = await scraper.getSeries(input)
      console.log(`Series scraped!, Title: ${series.title}`)

      let serverSeries = await server.getSeries({ title: series.title, slug: slug })

      if (serverSeries.status === "success") {
         console.log(`Series already exists on Server, ID: ${serverSeries.data.id} | Title: ${serverSeries.data.title}`)
         if (serverSeries.data.project === "1") {
            console.log(`Series is a Project, Skipping...`)
            continue
         }
      } else if (serverSeries.status === "not-found") {
         console.log(`Series does not exist on Server, Creating...`)
         const newSeries = await server.postSeries(series)
         if (newSeries.status !== "success") throw new Error(`[SERVER][POST][SERIES] ${newSeries.status}`)

         serverSeries = await server.getSeries({ title: newSeries.title, slug: slug })
         if (serverSeries.status !== "success") throw new Error(`[SERVER][GET][SERIES] ${serverSeries.status}`)

         console.log(`New Series Created, ID: ${newSeries.id} | Title: ${newSeries.title}`)
      }
      
      const notExistChapters = series.chapters.filter(
         (chapter: any) => !serverSeries.data.chapters.includes(chapter.chapter)
       )
       console.log(`Chapters to be added: ${notExistChapters.length}`)
       if (notExistChapters.length === 0) {
         console.log(`All chapters already exist on Server, Skipping...`)
         continue
       }

       for (const item of notExistChapters) {
         try {
            console.log(`Scraping chapter ${item.chapter}...`)
            const chapterData = await scraper.getChapter(item.url)
            console.log(`Chapter scraped!, Title: ${chapterData.title}`)
   
            console.log(`Downloading chapter ${item.chapter}...`)
            const filepaths = await downloads(chapterData.sources, {
               identity: "ichimonji",
               title: series.title,
               chapter: item.chapter
             })
   
            console.log(`Uploading chapter ${item.chapter}...`)
            const dir = `${series.title[0].toLowerCase()}/${series.title
            .toLowerCase()
            .replace(/ /g, "-")}/chapter-${item.chapter
            .toLowerCase()
            .replace(/ /g, "-")}`
            const stored = await storage.uploads(filepaths, dir)
   
            console.log(`Posting chapter ${item.chapter}...`)
            const newChapter = await server.postChapter({
               seriesId: serverSeries.data.id,
               title: chapterData.title,
               chapter: item.chapter,
               sources: stored.map(item => item.replace("", ""))
             })
   
            if (newChapter.status !== "success") throw new Error(`[SERVER][POST][CHAPTER] ${newChapter.status}`)
            console.log(`New Chapter Created, ID: ${newChapter.data.id} | Title: ${newChapter.data.title}`)
         } catch (error) {
            console.error(error)
         }
       }
   } catch (error) {
      console.log(error)
   }
}