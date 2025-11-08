import { Phase } from '@prisma/client';

export interface PhaseMappingSeedData {
  workflowCode: string;
  allowedPhases: Phase[];
  description: string;
}

export const phaseMappingsData: PhaseMappingSeedData[] = [
  {
    workflowCode: 'Business Modeling',
    allowedPhases: [Phase.Inception, Phase.Elaboration],
    description:
      'Business modeling activities occur in early phases to establish business context and validate business case.',
  },
  {
    workflowCode: 'Requirements',
    allowedPhases: [Phase.Inception, Phase.Elaboration],
    description:
      'Requirements are captured during inception and refined during elaboration to establish a stable baseline.',
  },
  {
    workflowCode: 'Analysis & Design',
    allowedPhases: [Phase.Elaboration, Phase.Construction],
    description:
      'Design work spans elaboration (architectural design) and construction (detailed design and refinement).',
  },
  {
    workflowCode: 'Implementation',
    allowedPhases: [Phase.Construction],
    description:
      'Code implementation primarily occurs during construction phase when architecture is stable.',
  },
  {
    workflowCode: 'Test',
    allowedPhases: [Phase.Construction, Phase.Transition],
    description:
      'Testing occurs throughout construction and intensifies during transition to ensure quality.',
  },
  {
    workflowCode: 'Deployment',
    allowedPhases: [Phase.Transition],
    description:
      'Deployment activities are concentrated in the transition phase to deliver product to users.',
  },
  {
    workflowCode: 'Configuration & Change Management',
    allowedPhases: [
      Phase.Inception,
      Phase.Elaboration,
      Phase.Construction,
      Phase.Transition,
    ],
    description:
      'Configuration and change management activities span all phases to maintain project integrity.',
  },
  {
    workflowCode: 'Project Management',
    allowedPhases: [
      Phase.Inception,
      Phase.Elaboration,
      Phase.Construction,
      Phase.Transition,
    ],
    description:
      'Project management is continuous across all phases to guide project execution.',
  },
  {
    workflowCode: 'Environment',
    allowedPhases: [
      Phase.Inception,
      Phase.Elaboration,
      Phase.Construction,
      Phase.Transition,
    ],
    description:
      'Environment setup and maintenance occurs throughout the project to support development activities.',
  },
];