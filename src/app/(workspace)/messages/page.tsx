import { MessageGenerator } from "@/components/message-generator";
import { APP_USER } from "@/lib/workspace";
import { getMessages } from "@/lib/data";

export default async function MessagesPage() {
  const history = await getMessages(APP_USER.id);
  return <MessageGenerator initialHistory={history} />;
}
