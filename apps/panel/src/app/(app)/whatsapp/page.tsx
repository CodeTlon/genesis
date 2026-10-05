import { MessagingCost } from '@/components/messaging-cost'
import { WhatsAppSim } from '@/components/whatsapp-sim'

export default function WhatsApp() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">WhatsApp</h1>
        <p className="mt-2 rounded-card bg-lila/50 p-3">Esto es una <strong>simulación</strong> de cómo funcionaría. No se conecta a WhatsApp real: eso llega en una etapa posterior.</p>
      </div>
      <WhatsAppSim />
      <MessagingCost />
    </main>
  )
}
