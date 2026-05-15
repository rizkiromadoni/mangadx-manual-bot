import axios from "axios";
import * as cheerio from "cheerio";

function fetchAZ(url: string) {
   return axios.get(new URL(url, `https://www.azlyrics.com`).href, {
      headers: {
         "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36",
         Referer: "https://www.google.com/",
      },
   });
}

const { data: bandListHtml} = await fetchAZ("a.html")
const $bandList = cheerio.load(bandListHtml)
const bandLinks = $bandList('.artist-col a').map((i, el) => $bandList(el).attr('href')).get()

for (const bandLink of bandLinks) {
   try {
      const { data: songListHtml} = await fetchAZ(bandLink)
      const $songList = cheerio.load(songListHtml)
      const songLinks = $songList('.listalbum-item a').map((i, el) => $songList(el).attr('href')).get()

      for (const songLink of songLinks) {
         try {
            const { data: songHtml} = await fetchAZ(songLink)
            const $song = cheerio.load(songHtml)

            const pageTitle = $song("title").text().replace(" Lyrics | AZLyrics.com", "").trim();
            const [band, title] = pageTitle.split(" - ");

            const lyricsDiv = $song('.col-xs-12.col-lg-8.text-center div').filter((i, el) => $song(el).text().length > 200 && !$song(el).attr('class'))
            .first();
            const lyrics = lyricsDiv.text().trim();

            console.log(pageTitle)
            await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 8000));
         } catch (error) {
            console.log(error)
         }
      }
   } catch (error) {
      console.log(error)
   }
}