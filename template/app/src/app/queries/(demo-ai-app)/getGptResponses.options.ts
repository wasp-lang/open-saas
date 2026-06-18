import { options } from "@wasp.sh/file-based-routing";

export default options({
  query: { entities: ["User", "GptResponse"] },
});
