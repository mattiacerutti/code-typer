/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import {LanguageName} from "@/types/CodeLanguage";
import {getSupportedLanguage} from "@/utils/snippets/snippet-utils";

const TOKEN = import.meta.env.VITE_GITHUB_API_TOKEN;

const GITHUB_API_URL = "https://api.github.com";

export async function fetchRandomCodeFiles(language: LanguageName): Promise<string[]> {
  const extensionsFilter = getSupportedLanguage(language)
    .extensions.map((extension) => `extension:${extension}`)
    .join(" ");

  const request = () =>
    axios.get(`${GITHUB_API_URL}/search/code`, {
      params: {
        q: `language:${language} size:>3000 ${extensionsFilter}`,
        page: Math.ceil(Math.random() * 10),
        per_page: 100,
      },
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

  let response = await request();

  // Sometimes the request is succesfull but the items array is empty. In this case, we just need to re-try the request
  if (response.data.items.length === 0) {
    response = await request();
  }

  if(response.data.items.length === 0) {
    throw "Request was successfull but the items array was empty for two times in a row";
  }

  return response.data.items.map((item: any) => item.url);
}

export async function fetchFileDetails(fileUrl: string): Promise<any> {
  const response = await axios.get(fileUrl, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  return response.data;
}

export async function getFileContent(fileDetails: any): Promise<string> {
  const rawUrl = fileDetails.download_url;

  // console.log("Raw Url:", rawUrl);

  const response = await axios.get(rawUrl);
  return response.data;
}
