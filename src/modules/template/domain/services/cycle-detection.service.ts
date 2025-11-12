import { ValidationIssueEntity } from '../entities/validation-issue.entity';
import { 
  buildAdjacencyList, 
  detectCycle, 
  wouldCreateCycle,
  type GraphEdge,
  type CycleDetectionResult
} from '@/shared/utils/graph-utils';
import { TemplateRepository } from '../../repositories/template.repository';

export class CycleDetectionService {
  constructor(
    private readonly templateRepository: TemplateRepository
  ) {}

  async checkCircularDependency(templateId: string): Promise<ValidationIssueEntity[]> {
    const issues: ValidationIssueEntity[] = [];

    const template = await this.templateRepository.findByIdWithRelations(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const config = await this.templateRepository.getConfig(templateId);
    const maxDepth = config?.maxDepth ?? 100;

    const adjList = this.buildGlobalAdjacencyList(template);

    const result = detectCycle(adjList, maxDepth);

    if (result.hasCycle && result.cyclePath) {
      const nodeLabels = this.buildNodeLabelMap(template);

      const issue = ValidationIssueEntity.createCircularDependency(
        templateId,
        result.cyclePath,
        nodeLabels
      );

      issues.push(issue);
    }

    if (result.depthExceeded) {
      console.warn(
        `Cycle detection depth limit (${maxDepth}) exceeded for template ${templateId}. ` +
        `Maximum depth reached: ${result.maxDepthReached}`
      );
    }

    return issues;
  }

  async wouldCreateCycle(
    templateId: string,
    sourceFullId: string,
    targetFullId: string
  ): Promise<CycleDetectionResult> {
    const template = await this.templateRepository.findByIdWithRelations(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const config = await this.templateRepository.getConfig(templateId);
    const maxDepth = config?.maxDepth ?? 100;

    const adjList = this.buildGlobalAdjacencyList(template);

    const wouldCycle = wouldCreateCycle(adjList, sourceFullId, targetFullId, maxDepth);

    if (wouldCycle) {
      if (!adjList.has(sourceFullId)) {
        adjList.set(sourceFullId, []);
      }
      adjList.get(sourceFullId)!.push(targetFullId);

      const result = detectCycle(adjList, maxDepth);

      return {
        hasCycle: true,
        cyclePath: result.cyclePath,
        depthExceeded: result.depthExceeded,
        maxDepthReached: result.maxDepthReached
      };
    }

    return {
      hasCycle: false,
      depthExceeded: false
    };
  }

  async getCyclePath(templateId: string): Promise<string[] | null> {
    const template = await this.templateRepository.findByIdWithRelations(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const config = await this.templateRepository.getConfig(templateId);
    const maxDepth = config?.maxDepth ?? 100;

    const adjList = this.buildGlobalAdjacencyList(template);
    const result = detectCycle(adjList, maxDepth);

    return result.cyclePath || null;
  }

  async hasCycle(templateId: string): Promise<boolean> {
    const cyclePath = await this.getCyclePath(templateId);
    return cyclePath !== null;
  }

  async getCycleStatistics(templateId: string): Promise<{
    hasCycle: boolean;
    cycleCount: number;
    cyclePaths: string[][];
    maxDepthReached: number;
    depthExceeded: boolean;
  }> {
    const template = await this.templateRepository.findByIdWithRelations(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const config = await this.templateRepository.getConfig(templateId);
    const maxDepth = config?.maxDepth ?? 100;

    const adjList = this.buildGlobalAdjacencyList(template);
    const result = detectCycle(adjList, maxDepth);

    const cyclePaths: string[][] = result.cyclePath ? [result.cyclePath] : [];

    return {
      hasCycle: result.hasCycle,
      cycleCount: cyclePaths.length,
      cyclePaths,
      maxDepthReached: result.maxDepthReached || 0,
      depthExceeded: result.depthExceeded || false
    };
  }

  private buildGlobalAdjacencyList(template: any): Map<string, string[]> {
    const edges: GraphEdge[] = [];

    for (const workflow of template.workflows || []) {
      for (const edge of workflow.edges || []) {
        edges.push({
          source: edge.source,
          target: edge.target,
          weight: edge.weight
        });
      }
    }

    for (const dep of template.crossFlowDependencies || []) {
      edges.push({
        source: dep.sourceFullId,
        target: dep.targetFullId,
        weight: dep.weight
      });
    }

    return buildAdjacencyList(edges);
  }

  private buildNodeLabelMap(template: any): Map<string, string> {
    const labelMap = new Map<string, string>();

    for (const workflow of template.workflows || []) {
      for (const node of workflow.nodes || []) {
        const readableLabel = `${workflow.name}.${node.label}`;
        labelMap.set(node.fullId, readableLabel);
      }
    }

    return labelMap;
  }

  validateCycleDetectionResult(result: CycleDetectionResult): void {
    if (result.hasCycle && !result.cyclePath) {
      throw new Error('Cycle detected but path not provided');
    }

    if (result.depthExceeded && !result.maxDepthReached) {
      throw new Error('Depth exceeded but max depth not provided');
    }

    if (result.cyclePath && result.cyclePath.length < 2) {
      throw new Error('Cycle path must contain at least 2 nodes');
    }
  }
}