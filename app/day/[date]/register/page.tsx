import { getDeckQueue } from "@/lib/actions";
import RegisterDeck from "@/components/day/RegisterDeck";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ params }: { params: { date: string } }) {
  const queue = await getDeckQueue(params.date);
  return <RegisterDeck date={params.date} initialQueue={queue} />;
}
