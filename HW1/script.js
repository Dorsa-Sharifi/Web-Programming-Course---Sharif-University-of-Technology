class FormulaCalculator extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.evaluator = this.getAttribute('evaluator') || '';
      this.render();
    }
  
    static get observedAttributes() {
      return ['evaluator'];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'evaluator' && oldValue !== newValue) {
        this.evaluator = newValue;
        this.render();
      }
    }
  
    safeEval(expression, variables) {
      try {
        let safeExpression = expression;
        for (const [varName, value] of Object.entries(variables)) {
          const regex = new RegExp(`\\b${varName}\\b`, 'g');
          safeExpression = safeExpression.replace(regex, value);
        }
        
        return new Function(`return ${safeExpression}`)();
      } catch (error) {
        console.error('Evaluation error:', error);
        return null;
      }
    }
  
    getInputValues() {
      const inputs = document.querySelectorAll("input[type='text']");
      const values = {};
      let allValid = true;
  
      inputs.forEach(input => {
        const value = input.value.trim();
        const numValue = value === "" ? 0 : parseFloat(value);
        values[input.id] = numValue;
        
        if (isNaN(numValue) || value.length === 0) {
          allValid = false;
        }
      });
  
      return { values, allValid };
    }
  
    render() {
        const { values, allValid } = this.getInputValues();
        const result = allValid ? this.safeEval(this.evaluator, values) : null;
        //I used chatgpt for desingning this part to make a more beautiful calculator
        this.shadowRoot.innerHTML = `
            <style>
                .formula-item {
                    background: white;
                    padding: 1rem;
                    margin-bottom: 0.75rem;
                    border-radius: var(--border-radius);
                    box-shadow: var(--box-shadow);
                    transition: var(--transition);
                    animation: fadeIn 0.3s ease-out;
                }
                
                .formula-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
                }
                
                .formula-expression {
                    font-family: 'Courier New', monospace;
                    color: var(--primary);
                    margin-bottom: 0.25rem;
                    font-size: 0.9rem;
                }
                
                .formula-result {
                    font-weight: 600;
                    color: var(--dark);
                    font-size: 1.1rem;
                }
                
                .formula-error {
                    color: var(--danger);
                    font-weight: 500;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
            
            <div class="formula-item">
                ${allValid 
                    ? `<div class="formula-expression">${this.evaluator}</div>
                       <div class="formula-result">= ${result.toFixed(2)}</div>`
                    : '<div class="formula-error"><i class="fas fa-exclamation-circle"></i> Please enter valid numbers</div>'
                }
            </div>
        `;
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    customElements.define("custom-formula", FormulaCalculator);
  
    const inputs = document.querySelectorAll("input[type='text']");
    const formulas = document.querySelectorAll("custom-formula");
  
    const calculateAllFormulas = () => {
      formulas.forEach(formula => formula.render());
    };
  
    inputs.forEach(input => {
      input.addEventListener("input", calculateAllFormulas);
    });
  
    calculateAllFormulas();
  });