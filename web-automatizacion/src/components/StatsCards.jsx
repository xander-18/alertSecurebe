import StatsCard from './StatsCard'
import { DollarSign, Users, ShoppingCart, Activity } from 'lucide-react'

const statsCards = [
  {
    title: "Ventas Totales",
    value: "$45,231.89",
    change: "+20.1%",
    Icon: DollarSign,
  },
  {
    title: "Usuarios Activos",
    value: "2,350",
    change: "+180.1%",
    Icon: Users,
  },
  {
    title: "Pedidos",
    value: "12,234",
    change: "+19%",
    Icon: ShoppingCart,
  },
  {
    title: "Conversión",
    value: "3.2%",
    change: "+4.75%",
    Icon: Activity,
  },
]

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  )
}