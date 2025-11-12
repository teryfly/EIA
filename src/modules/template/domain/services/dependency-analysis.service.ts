import { 
  buildAdjacencyList, 
  getDownstreamNodes, 
  getUpstreamNodes,
  findAllPaths,
  type GraphEdge
} from '@/shared/utils/graph-utils';
import { TemplateRepository } from '../../repositories/template.repository';
import { EdgeRepository } from '../../repositories/edge.repository';
import { CrossFlowDependencyRepository } from '../../repositories/cross-flow-dependency.repository';

export interface DependencyImpact {
  affectedNodeCount: number;
  affectedNodes: string[];
  affectedWorkflows: string[];
  hasCrossFlowImpact: boolean;
}

export interface DependencyPath {
  path: string[];
  length: number;
  hasOptionalEdges: boolean;
}

export interface OrphanedNodesResult {
  orphanedNodes: string[];
  orphanedNodeCount: number;
  details: Array<{
    nodeFullId: string;
    nodeName: string;
    onlyUpstreamDependency: string;
  }>;
}

export interface CrossFlowImpactResult {
  affectedDependencies: number;
  incomingDependencies: Array<{
    id: string;
    sourceFullId: string;
    targetFullId: string;
    type: string;
  }>;
  outgoingDependencies: Array<{
    id: string;
    sourceFullId: string;
    targetFullId: string;
    type: string;
  }>;
}

export interface DependencyStatistics {
  totalEdges: number;
  flowInternalEdges: number;
  crossFlowDependencies: number;
  requiredEdges: number;
  optionalEdges: number;
  averageDependenciesPerNode: number;
  maxInDegree: number;
  maxOutDegree: number;
  isolatedNodes: number;
}

export class DependencyAnalysisService {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly edgeRepository: EdgeRepository,
    private readonly crossFlowDependencyRepository: CrossFlowDependencyRepository
  ) {}

  async analyzeDownstreamImpact(
    templateId: string,
    nodeFullId: string
  ): Promise<DependencyImpact> {
    const template = await this.templateRepository.findByIdWithRelations(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const adjList = this.buildGlobalAdjacencyList(template);

    const config = await this.templateRepository.getConfig(templateId);
    const maxDepth = config?.maxDepth ?? 100;
    const downstreamNodes = getDownstreamNodes(adjList, nodeFullId, maxDepth);

    const affectedWorkflows = new Set<string>();
    for (const node of downstreamNodes) {
      const workflowId = node.split('.')[0];
      affectedWorkflows.add(workflowId);
    }

    const sourceWorkflowId = nodeFullId.split('.')[0];
    const hasCrossFlowImpact = Array.from(affectedWorkflows).some(
      wf => wf !== sourceWorkflowId
    );

    return {
      affectedNodeCount: downstreamNodes.size,
      affectedNodes: Array.from(downstreamNodes),
      affectedWorkflows: Array.from(affectedWorkflows),
      hasCrossFlowImpact
    };
  }

  async analyzeUpstreamDependencies(
    templateId: string,
    nodeFullId: string
  ): Promise<DependencyImpact> {
    const template = await this.templateRepository.findByIdWithRelations(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const adjList = this.buildGlobalAdjacencyList(template);

    const config = await this.templateRepository.getConfig(templateId);
    const maxDepth = config?.maxDepth ?? 100;
    const upstreamNodes = getUpstreamNodes(adjList, nodeFullId, maxDepth);

    const affectedWorkflows = new Set<string>();
    for (const node of upstreamNodes) {
      const workflowId = node.split('.')[0];
      affectedWorkflows.add(workflowId);
    }

    const targetWorkflowId = nodeFullId.split('.')[0];
    const hasCrossFlowImpact = Array.from(affectedWorkflows).some(
      wf => wf !== targetWorkflowId
    );

    return {
      affectedNodeCount: upstreamNodes.size,
      affectedNodes: Array.from(upstreamNodes),
      affectedWorkflows: Array.from(affectedWorkflows),
      hasCrossFlowImpact
    };
  }

  async findDependencyPaths(
    templateId: string,
    sourceFullId: string,
    targetFullId: string,
    maxPaths: number = 10
  ): Promise<DependencyPath[]> {
    const template = await this.templateRepository.findByIdWithRelations(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const adjList = this.buildGlobalAdjacencyList(template);

    const config = await this.templateRepository.getConfig(templateId);
    const maxDepth = config?.maxDepth ?? 100;

    const paths = findAllPaths(adjList, sourceFullId, targetFullId, maxPaths, maxDepth);

    return paths.map(path => ({
      path,
      length: path.length - 1,
      hasOptionalEdges: false
    }));
  }

  async checkOrphanedNodesAfterDeletion(
    templateId: string,
    nodeFullId: string
  ): Promise<OrphanedNodesResult> {
    const template = await this.templateRepository.findByIdWithRelations(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const adjList = this.buildGlobalAdjacencyList(template);
    const config = await this.templateRepository.getConfig(templateId);
    const maxDepth = config?.maxDepth ?? 100;
    
    const downstreamNodes = getDownstreamNodes(adjList, nodeFullId, maxDepth);
    const orphanedNodes: string[] = [];
    const details: OrphanedNodesResult['details'] = [];

    const nodeNameMap = this.buildNodeNameMap(template);

    for (const node of downstreamNodes) {
      const upstreamNodes = getUpstreamNodes(adjList, node, maxDepth);
      
      if (upstreamNodes.size === 1 && upstreamNodes.has(nodeFullId)) {
        orphanedNodes.push(node);
        details.push({
          nodeFullId: node,
          nodeName: nodeNameMap.get(node) || node,
          onlyUpstreamDependency: nodeFullId
        });
      }
    }

    return {
      orphanedNodes,
      orphanedNodeCount: orphanedNodes.length,
      details
    };
  }

  async checkCrossFlowImpactAfterWorkflowDeletion(
    templateId: string,
    workflowId: string
  ): Promise<CrossFlowImpactResult> {
    const incoming = await this.crossFlowDependencyRepository.findByTargetWorkflow(workflowId);
    const outgoing = await this.crossFlowDependencyRepository.findBySourceWorkflow(workflowId);

    return {
      affectedDependencies: incoming.length + outgoing.length,
      incomingDependencies: incoming.map(d => ({
        id: d.id,
        sourceFullId: d.sourceFullId,
        targetFullId: d.targetFullId,
        type: d.type
      })),
      outgoingDependencies: outgoing.map(d => ({
        id: d.id,
        sourceFullId: d.sourceFullId,
        targetFullId: d.targetFullId,
        type: d.type
      }))
    };
  }

  async getDependencyStatistics(templateId: string): Promise<DependencyStatistics> {
    const template = await this.templateRepository.findByIdWithRelations(templateId);

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let flowInternalEdges = 0;
    let requiredFlowEdges = 0;
    let optionalFlowEdges = 0;

    for (const workflow of template.workflows || []) {
      flowInternalEdges += (workflow.edges || []).length;
      
      for (const edge of workflow.edges || []) {
        if (edge.type === 'required') {
          requiredFlowEdges++;
        } else {
          optionalFlowEdges++;
        }
      }
    }

    const crossFlowDeps = template.crossFlowDependencies || [];
    const requiredCrossDeps = crossFlowDeps.filter((d: any) => d.type === 'required').length;
    const optionalCrossDeps = crossFlowDeps.length - requiredCrossDeps;

    const totalEdges = flowInternalEdges + crossFlowDeps.length;
    const requiredEdges = requiredFlowEdges + requiredCrossDeps;
    const optionalEdges = optionalFlowEdges + optionalCrossDeps;

    let totalNodes = 0;
    for (const workflow of template.workflows || []) {
      totalNodes += (workflow.nodes || []).length;
    }

    const averageDependenciesPerNode = totalNodes > 0 ? totalEdges / totalNodes : 0;

    const adjList = this.buildGlobalAdjacencyList(template);
    const { maxInDegree, maxOutDegree, isolatedNodes } = this.calculateDegreeStatistics(adjList);

    return {
      totalEdges,
      flowInternalEdges,
      crossFlowDependencies: crossFlowDeps.length,
      requiredEdges,
      optionalEdges,
      averageDependenciesPerNode: parseFloat(averageDependenciesPerNode.toFixed(2)),
      maxInDegree,
      maxOutDegree,
      isolatedNodes
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

  private buildNodeNameMap(template: any): Map<string, string> {
    const nameMap = new Map<string, string>();

    for (const workflow of template.workflows || []) {
      for (const node of workflow.nodes || []) {
        nameMap.set(node.fullId, node.label);
      }
    }

    return nameMap;
  }

  private calculateDegreeStatistics(adjList: Map<string, string[]>): {
    maxInDegree: number;
    maxOutDegree: number;
    isolatedNodes: number;
  } {
    const inDegree = new Map<string, number>();
    const allNodes = new Set<string>();

    for (const [source, targets] of adjList.entries()) {
      allNodes.add(source);
      if (!inDegree.has(source)) {
        inDegree.set(source, 0);
      }
      for (const target of targets) {
        allNodes.add(target);
        inDegree.set(target, (inDegree.get(target) || 0) + 1);
      }
    }

    let maxInDegree = 0;
    let maxOutDegree = 0;
    let isolatedNodes = 0;

    for (const node of allNodes) {
      const inDeg = inDegree.get(node) || 0;
      const outDeg = (adjList.get(node) || []).length;

      if (inDeg > maxInDegree) {
        maxInDegree = inDeg;
      }

      if (outDeg > maxOutDegree) {
        maxOutDegree = outDeg;
      }

      if (inDeg === 0 && outDeg === 0) {
        isolatedNodes++;
      }
    }

    return { maxInDegree, maxOutDegree, isolatedNodes };
  }
}