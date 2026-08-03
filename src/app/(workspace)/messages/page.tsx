import { MessageGenerator } from "@/components/message-generator";
import { getAppUser } from "@/lib/workspace";
import { getMessages } from "@/lib/data";

export default async function MessagesPage() {
  const user = await getAppUser();
  const history = await getMessages(user.id);
  return <MessageGenerator initialHistory={history} />;
}
