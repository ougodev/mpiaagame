import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MPIAA Game - By Oussama Gobji',
  description: 'Joue à MPIAA Game avec tes amis en ligne ! Développé par Oussama Gobji',
  authors: [{ name: 'Oussama Gobji' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
