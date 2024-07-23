/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { LanguageName } from "@/types/CodeLanguage";
import { getSupportedLanguage } from "@/utils/snippets/snippet-utils";

const TOKEN = import.meta.env.VITE_GITHUB_API_TOKEN;

const GITHUB_API_URL = "https://api.github.com";

export async function fetchRandomCodeFiles(language: LanguageName): Promise<string[]> {

  const extensionsFilter = getSupportedLanguage(language).extensions.map((extension) => `extension:${extension}`).join(" ");

  const response = await axios.get(`${GITHUB_API_URL}/search/code`, {
    params: {
      q: `language:${language} size:>3000 ${extensionsFilter}`,
      page: Math.floor(Math.random() * 10),
      per_page: 100,
    },
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
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

  console.log("Raw Url:", rawUrl);

  const response = await axios.get(rawUrl);
  return response.data;
}