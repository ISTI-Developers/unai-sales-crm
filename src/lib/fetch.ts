import axios from "axios";

export async function fetchFromLark(url: string, options: RequestInit) {
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error_msg || JSON.stringify(result));
  }
  return result;
}
export const fetchImage: (
  imageLink: string
) => Promise<string | undefined> = async (imageLink: string) => {
  try {
    const response = await axios.get(imageLink, {
      responseType: "blob", // This ensures binary data is received
    });

    const imgUrl = URL.createObjectURL(response.data);
    return imgUrl;
  } catch (error) {
    console.error("Error fetching image:", error);
  }
};
