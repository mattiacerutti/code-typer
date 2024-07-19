/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const TOKEN = import.meta.env.VITE_GITHUB_API_TOKEN;

const GITHUB_API_URL = "https://api.github.com";

export class FetchService {
   static async fetchRandomCodeFiles(language: string): Promise<string[]> {
      const response = await axios.get(`${GITHUB_API_URL}/search/code`, {
         params: {
            q: `language:${language} size:>10000`,
         },
         headers: {
            Authorization: `Bearer ${TOKEN}`,
         },
      });
      return response.data.items.map((item: any) => item.url);
   }

   static async fetchFileDetails(fileUrl: string): Promise<any> {
      const response = await axios.get(fileUrl, {
         headers: {
            Authorization: `Bearer ${TOKEN}`,
         },
      });
      return response.data;
   }

   static async getFileContent(fileDetails: any): Promise<string> {
      const rawUrl = fileDetails.download_url;

      console.log("Raw Url:", rawUrl);

      const response = await axios.get(rawUrl);
      return response.data;
   }
}
