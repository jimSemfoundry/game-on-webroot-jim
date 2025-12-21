import { AlliancePartnershipLuisSuarez } from '@/sections/alliance-partnerships/alliance-partnership-luis-suarez'
import { AlliancePartnershipAFA } from '@/sections/alliance-partnerships/alliance-partnership-afa'
import { createFileRoute } from '@tanstack/react-router'
import { AlliancePartnershipVCF } from '@/sections/alliance-partnerships/alliance-partnership-vcf'

export const Route = createFileRoute('/_main/partnerships/$partnershipId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { partnershipId } = Route.useParams()
  return (
    {
      "luis-suarez": <AlliancePartnershipLuisSuarez />,
      "afa": <AlliancePartnershipAFA />,
      "vfc": <AlliancePartnershipVCF />
    }[partnershipId]
  )
}
