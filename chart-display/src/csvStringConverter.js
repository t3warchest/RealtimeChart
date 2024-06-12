import Papa from "papaparse";

const csvStringConverter = async (csvFile) => {
  const response = await fetch(csvFile);
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  const result = await reader.read();
  const csv = decoder.decode(result.value);
  const { data } = Papa.parse(csv, { header: true });
  return data;
};

export default csvStringConverter;
