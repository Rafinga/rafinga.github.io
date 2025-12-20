import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Method } from "../phase-2/semantics/ir";
import { BasicBlock } from "./cfgTypes";

cytoscape.use(dagre);

const visitedBlocks = new Set<string>();
let tabContainer: HTMLElement | null = null;
const methodGraphs = new Map<string, { cy: any, container: HTMLElement }>();

function resetVisualization(): void {
  // Destroy all cytoscape instances
  methodGraphs.forEach(graph => {
    graph.cy.destroy();
  });
  
  // Clear data structures
  methodGraphs.clear();
  
  // Remove tab container from DOM
  if (tabContainer && tabContainer.parentElement) {
    tabContainer.parentElement.removeChild(tabContainer);
  }
  
  // Reset state
  tabContainer = null;
}

function collectBlocks(block: BasicBlock, blocks: BasicBlock[]): void {
  if (visitedBlocks.has(block.label)) return;
  
  visitedBlocks.add(block.label);
  blocks.push(block);
  
  block.getSuccessors().forEach(successor => {
    collectBlocks(successor, blocks);
  });
}

function createTabContainer(parentContainer: HTMLElement): HTMLElement {
  if (tabContainer) return tabContainer;
  
  tabContainer = document.createElement('div');
  tabContainer.style.position = 'absolute';
  tabContainer.style.top = parentContainer.offsetTop + 'px';
  tabContainer.style.left = parentContainer.offsetLeft + 'px';
  tabContainer.style.width = parentContainer.offsetWidth + 'px';
  tabContainer.style.height = parentContainer.offsetHeight + 'px';
  tabContainer.style.zIndex = '1000';
  tabContainer.style.backgroundColor = '#fff';
  tabContainer.style.border = '1px solid #ccc';
  
  const tabBar = document.createElement('div');
  tabBar.style.height = '30px';
  tabBar.style.borderBottom = '1px solid #ccc';
  tabBar.style.display = 'flex';
  tabBar.style.alignItems = 'center';
  tabBar.id = 'method-tabs';
  
  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset View';
  resetButton.style.padding = '5px 10px';
  resetButton.style.border = '1px solid #ccc';
  resetButton.style.backgroundColor = '#e0e0e0';
  resetButton.style.cursor = 'pointer';
  resetButton.style.marginLeft = 'auto';
  resetButton.onclick = () => {
    const activeMethod = Array.from(methodGraphs.entries()).find(([name, graph]) => 
      graph.container.style.display === 'block'
    );
    if (activeMethod) {
      activeMethod[1].cy.fit(50);
      activeMethod[1].cy.center();
    }
  };
  tabBar.appendChild(resetButton);
  
  const contentArea = document.createElement('div');
  contentArea.style.height = 'calc(100% - 30px)';
  contentArea.id = 'method-content';
  
  tabContainer.appendChild(tabBar);
  tabContainer.appendChild(contentArea);
  parentContainer.parentElement?.appendChild(tabContainer);
  
  return tabContainer;
}

function createTab(methodName: string): void {
  const tabBar = document.getElementById('method-tabs');
  if (!tabBar) return;
  
  const tab = document.createElement('button');
  tab.textContent = methodName;
  tab.style.padding = '5px 10px';
  tab.style.border = '1px solid #ccc';
  tab.style.backgroundColor = '#f0f0f0';
  tab.style.cursor = 'pointer';
  
  tab.onclick = () => showMethod(methodName);
  tabBar.insertBefore(tab, tabBar.lastElementChild); // Insert before reset button
}

function showMethod(methodName: string): void {
  const contentArea = document.getElementById('method-content');
  if (!contentArea) return;
  
  // Hide all method containers
  methodGraphs.forEach((graph, name) => {
    graph.container.style.display = 'none';
  });
  
  // Show selected method
  const selected = methodGraphs.get(methodName);
  if (selected) {
    selected.container.style.display = 'block';
    selected.cy.resize();
    selected.cy.fit(50);
    selected.cy.center();
  }
  
  // Update tab styles
  const tabs = document.querySelectorAll('#method-tabs button') as NodeListOf<HTMLButtonElement>;
  tabs.forEach(tab => {
    (tab as HTMLButtonElement).style.backgroundColor = tab.textContent === methodName ? '#fff' : '#f0f0f0';
  });
}

export function visualizeMethod(method: Method, entryBlock: BasicBlock, container: HTMLElement | HTMLCanvasElement) {
  let parentContainer: HTMLElement;
  if (container instanceof HTMLCanvasElement) {
    parentContainer = container;
  } else {
    parentContainer = container;
  }
  
  const tabs = createTabContainer(parentContainer);
  const contentArea = document.getElementById('method-content');
  if (!contentArea) return;
  
  // Create method container
  const methodContainer = document.createElement('div');
  methodContainer.style.width = '100%';
  methodContainer.style.height = '100%';
  methodContainer.style.display = 'none';
  contentArea.appendChild(methodContainer);
  
  visitedBlocks.clear();
  const blocks: BasicBlock[] = [];
  collectBlocks(entryBlock, blocks);
  
  if (blocks.length === 0) return;
  
  const elements = [
    ...blocks.map(block => ({
      data: { 
        id: block.label, 
        label: `${block.label}\n${block.instructions.slice(1).map(i => i.toString()).join('\n')}`
      }
    })),
    ...blocks.flatMap(block => 
      block.getSuccessors().map(succ => ({ 
        data: { source: block.label, target: succ.label } 
      }))
    )
  ];
  
  const cy = cytoscape({
    container: methodContainer,
    elements,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#f0f0f0',
          'label': 'data(label)',
          'text-wrap': 'wrap',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-family': 'monospace',
          'font-size': '10px',
          'color': '#000',
          'width': 'label',
          'height': 'label',
          'padding': '10px',
          'shape': 'rectangle',
          'border-width': 2,
          'border-color': '#333'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#333',
          'target-arrow-color': '#333',
          'target-arrow-shape': 'triangle',
          'target-arrow-size': 15,
          'curve-style': 'bezier'
        }
      }
    ],
    layout: { name: 'dagre', rankDir: 'TB' },
    zoom: 0.5,
    pan: { x: 0, y: 0 }
  });
  
  methodGraphs.set(method.method_name, { cy, container: methodContainer });
  createTab(method.method_name);
  
  setTimeout(() => {
    cy.fit(50); // 50px padding from edges
    cy.center();
    showMethod(method.method_name);
  }, 10);
}

export { resetVisualization };
