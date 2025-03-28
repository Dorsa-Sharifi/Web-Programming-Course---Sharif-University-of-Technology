# تمرین دستگرمی اول برنامه نویسی وب
این برنامه از 3 قطعه کد زیر تشکیل شده است: 
- index.html
- styles.css
- scripts.js
# کد html
در این بخش از کد با 3 ورودی متفاوت استفاده کردیم که به ترتیب عبارتند از: قیمت واحد، تعداد و مقدار تخفیف. از طرفی در خروجی 3 قیمت نهایی با توجه به 3 فرمول زیر را نمایش می‌دهیم:<br>
1. $(fee*count - discount)$
2. $(fee* count *1.09 - discount)$
3. $((fee-discount)*count)$<br>

طبق دستورالعمل سوال، باید هر یک از این ورودی‌ها به شکل برخط کار کنند. بعبارت بهتر با تغییر هر یک از 3 ورودی به شکل همزمان مقادیر نهایی محاسبه می‌شوند. کد `html` نهایی به شکل زیر است. قابل ذکر است تمام بخش‌های زیبایی بصری با کمک اینترنت و `Chatgpt` انجام شده است.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>✨ Live Formula Calculator</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="calculator-container">
        <header class="calculator-header">
            <h1><i class="fas fa-calculator"></i> Live Formula Calculator</h1>
            <p class="subtitle">Type values and see calculations update in real-time</p>
        </header>

        <div class="input-group">
            <label for="fee">
                <i class="fas fa-tag"></i> Unit price
            </label>
            <input type="text" id="fee" placeholder="0.00">
        </div>

        <div class="input-group">
            <label for="count">
                <i class="fas fa-cubes"></i> Quantity
            </label>
            <input type="text" id="count" placeholder="0">
        </div>

        <div class="input-group">
            <label for="discount">
                <i class="fas fa-percentage"></i> Discount
            </label>
            <input type="text" id="discount" placeholder="0.00">
        </div>

        <div class="formula-results">
            <h3><i class="fas fa-square-root-alt"></i> Formula Results</h3>
            
            <custom-formula evaluator="fee * count - discount"></custom-formula>
            <custom-formula evaluator="fee * count * 1.09 - discount"></custom-formula>
            <custom-formula evaluator="(fee - discount) * count"></custom-formula>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

 # کد js
 در این بخش برای قابل استفاده بودن کد به صورت مجدد، یک المان جدا برای فرمول‌ها طراحی می‌کنیم تا اصول شی‌گرایی نیز برقرار باشد. از طرفی برای آنکه خروجی همزمان با تغییر ورودی دوباره محاسبه شود و خروجی جدید نمایش داده شود از مفهوم `EventListener` استفاده می‌کنیم.

```javascript
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
```
در این بخش از کد جاوا اسکریپت با استفاده از `regex` مقادیر ورودی را به `id` مربوطه `set` می‌کنیم.

 ```javascript
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
```
این تابع تمام مقادیری که بعنوان ورودی وارد شدند را ابتدا چک می‌کند تا فرمت آنها معتبر باشد و سپس در صورت معتبر بودن، آنها را به عدد تبدیل می‌کند.
```javascript
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
```
با هر بار صدا شدن متود `render`، فرمول داده شده روی ورودی‌ها اعمال شده و خروجی نمایش داده می‍شود. در این متود تمام تطابق‌های دقیق رشته‌ فرمول داده شده با `id`های ورودی جایگذاری می‌شوند. طبق دستورالعمل سوال، در صورت تولید شدن `NaN` باید خطا نمایش داده شود.
این خطا با پیام `Please enter valid numbers` که به رنگ قرمز هست، نمایش داده می‌شود. قابل ذکر است در صورت باز کردن فایل در مرورگر برای اولین بار، مقادیر ورودی هنوز داده نشده‌اند و باید یک دور این متود را در `constructor` صدا بزنیم تا پیام `Please enter valid numbers`
همان ابتدا نیز نمایش داده شود. قابل ذکر است به منظور زیبایی بصری در این بخش تا حد خوبی از `Chatgpt` کمک گرفتم که در تگ `<style>` قابل مشاهده است.

```javascript
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
```
 در بخش نهایی کد `js`، با قرار دادن `EventListener` روی تمامی ورودی‌‌ها قابلیت محاسبه و `render` را برای محاسبه‌ی برخط خروجی با هر تغییر ورودی تنظیم می‌کنیم. 
 

