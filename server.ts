export default class Server {
   private apiURL: string
   private apiKey: string
   private authorId: number

   constructor({ apiURL, apiKey, authorId }: { apiURL: string, apiKey: string, authorId: number }) {
      this.apiURL = apiURL
      this.apiKey = apiKey
      this.authorId = authorId
   }

   async getSeries({ title, slug }: { title: string, slug: string }): Promise<any> {
      const response = await fetch(new URL(`/wp-json/mangadx/v1/series?title=${title}&post_name=${slug}`, this.apiURL).href, {
         method: "GET",
         headers: {
           "Content-Type": "application/json",
           "x-api-key": this.apiKey
         }
       })
   
       const data = await response.json() as any
       
       if (data.error) return Promise.reject(`[GET][SERVER][SERIES] ${data.error}`)
       if (response.status !== 200) return Promise.reject(`[GET][SERVER][SERIES] ${response.status} ${response.statusText}`)
   
       return data
   }

   async postSeries(args: any): Promise<any> {
      const body = {
         authorId: this.authorId,
         ...args
       }

       const response = await fetch(new URL("/wp-json/mangadx/v1/series", this.apiURL).href, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           "x-api-key": this.apiKey
         },
         body: JSON.stringify(body)
       })
   
       const data = await response.json() as any
   
       if (data.error) return Promise.reject(`[POST][SERVER][SERIES] ${data.error}`)
       if (response.status !== 200) return Promise.reject(`[POST][SERVER][SERIES] ${response.status} ${response.statusText}`)
   
       return data
   }

   async postChapter(args: any): Promise<any> {
      const body = {
         authorId: this.authorId,
         ...args
       }
   
       const response = await fetch(new URL("/wp-json/mangadx/v1/chapter", this.apiURL).href, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           "x-api-key": this.apiKey
         },
         body: JSON.stringify(body)
       })
   
       const data = await response.json() as any
   
       if (data.error) return Promise.reject(`[POST][SERVER][CHAPTER] ${data.error}`)
       if (response.status !== 200) return Promise.reject(`[POST][SERVER][CHAPTER] ${response.status} ${response.statusText}`)
   
       return data
   }
}