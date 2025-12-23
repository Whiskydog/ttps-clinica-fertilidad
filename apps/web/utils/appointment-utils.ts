import { ReasonForVisit } from "@repo/contracts";

export function getDisplayName(reason: ReasonForVisit) {
  switch (reason) {
    case ReasonForVisit.InitialConsultation:
      return "Primera consulta";
    case ReasonForVisit.StimulationMonitoring:
      return "Monitoreo de estimulación";
    case ReasonForVisit.EggRetrieval:
      return "Punción ovárica";
    case ReasonForVisit.EmbryoTransfer:
      return "Transferencia de embriones";
    default:
      return "Otro";
  }
}
