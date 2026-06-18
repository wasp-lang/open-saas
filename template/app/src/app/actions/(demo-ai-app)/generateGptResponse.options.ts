import { options } from "@wasp.sh/file-based-routing";

export default options({
  action: { entities: ["User", "Task", "GptResponse"] },
});
