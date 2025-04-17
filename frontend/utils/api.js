export async function fetchApi(endpoint, options = {}) {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }