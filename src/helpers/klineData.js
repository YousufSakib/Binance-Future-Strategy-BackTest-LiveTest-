const API_URL = "http://localhost:5000";

export async function getKlineData({ pair, duration }) {
  try {
    const response = await fetch(`${API_URL}/api/kline?pair=${pair}&duration=${duration}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;

  } catch (error) {
    console.error("Fetch Error:", error);
  }
}