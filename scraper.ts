export default class Scraper {
   private apiURL: string
   private apiKey: string
   private webName: string

   constructor({ apiURL, apiKey, webName }: { apiURL: string, apiKey: string, webName: string }) {
      this.apiURL = apiURL
      this.apiKey = apiKey
      this.webName = webName
   }

   async getFeed(): Promise<any> {
      const response = await fetch(new URL(`/${this.webName}/feed`, this.apiURL).href, {
         method: "GET",
         headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${this.apiKey}`
         }
       })
       const data = await response.json() as any
       if (data.error) return Promise.reject(`[SCRAPER][FEED] ${data.error}`)
       if (response.status !== 200) return Promise.reject(`[SCRAPER][FEED] ${response.status} ${response.statusText}`)
     
       return data
   }

   async getSeries(url: string): Promise<any> {
      const response = await fetch(new URL(`/${this.webName}/series?url=${url}`, this.apiURL).href, {
         method: "GET",
         headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${this.apiKey}`
         }
       })
       const data = await response.json() as any
       if (data.error) return Promise.reject(`[SCRAPER][SERIES] ${data.error}`)
       if (response.status !== 200) return Promise.reject(`[SCRAPER][SERIES] ${response.status} ${response.statusText}`)
     
       return data
   }

   async getChapter(url: string): Promise<any> {
      const response = await fetch(new URL(`/${this.webName}/chapter?url=${url}`, this.apiURL).href, {
         method: "GET",
         headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${this.apiKey}`
         }
       })
       const data = await response.json() as any
       if (data.error) return Promise.reject(`[SCRAPER][CHAPTER] ${data.error}`)
       if (response.status !== 200) return Promise.reject(`[SCRAPER][CHAPTER] ${response.status} ${response.statusText}`)
     
       return data
   }
}