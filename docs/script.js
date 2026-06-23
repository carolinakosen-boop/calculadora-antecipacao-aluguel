/**
 * Calculadora de Antecipação de Aluguel
 *
 * Fórmula: Valor Presente = Σ (Aluguel / (1 + taxa)^n), n = 1..N
 * Equivalente a: VP = Aluguel × [(1 - (1 + taxa)^(-N)) / taxa]
 */

document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('calculatorForm');
    var resultsPanel = document.getElementById('resultsPanel');
    var aluguelInput = document.getElementById('aluguel');
    var contratoInput = document.getElementById('contrato');
    var antecipacaoInput = document.getElementById('antecipacao');
    var taxaInput = document.getElementById('taxa');
    var yearSpan = document.getElementById('currentYear');

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Currency mask for aluguel
    aluguelInput.addEventListener('input', function () {
        var raw = this.value.replace(/\D/g, '');
        if (raw === '') {
            this.value = '';
            return;
        }
        var number = parseInt(raw, 10) / 100;
        this.value = formatCurrency(number).replace('R$ ', '');
    });

    // Rate mask (allow comma as decimal)
    taxaInput.addEventListener('input', function () {
        var val = this.value.replace(/[^0-9,]/g, '');
        // Only allow one comma
        var parts = val.split(',');
        if (parts.length > 2) {
            val = parts[0] + ',' + parts.slice(1).join('');
        }
        this.value = val;
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors();

        var aluguel = parseCurrency(aluguelInput.value);
        var contrato = parseInt(contratoInput.value, 10);
        var antecipacao = parseInt(antecipacaoInput.value, 10);
        var taxa = parseRate(taxaInput.value);

        var valid = true;

        if (isNaN(aluguel) || aluguel <= 0) {
            showError(aluguelInput, 'Informe um valor de aluguel válido');
            valid = false;
        }
        if (isNaN(contrato) || contrato <= 0) {
            showError(contratoInput, 'Informe o prazo do contrato');
            valid = false;
        }
        if (isNaN(antecipacao) || antecipacao <= 0) {
            showError(antecipacaoInput, 'Informe os meses a antecipar');
            valid = false;
        }
        if (isNaN(taxa) || taxa <= 0) {
            showError(taxaInput, 'Informe uma taxa de juros válida');
            valid = false;
        }
        if (valid && antecipacao > contrato) {
            showError(antecipacaoInput, 'Não pode exceder o prazo do contrato');
            valid = false;
        }

        if (!valid) return;

        var result = calcularAntecipacao(aluguel, antecipacao, taxa);
        exibirResultados(result, aluguel, antecipacao);
    });

    function calcularAntecipacao(aluguel, meses, taxaMensal) {
        var parcelas = [];
        var totalPresente = 0;

        for (var n = 1; n <= meses; n++) {
            var fator = Math.pow(1 + taxaMensal, n);
            var valorPresente = aluguel / fator;
            totalPresente += valorPresente;
            parcelas.push({
                mes: n,
                aluguel: aluguel,
                fator: fator,
                valorPresente: valorPresente
            });
        }

        var valorTotal = aluguel * meses;
        var desconto = valorTotal - totalPresente;
        var percentualDesconto = (desconto / valorTotal) * 100;

        return {
            valorAntecipado: totalPresente,
            valorTotal: valorTotal,
            desconto: desconto,
            percentualDesconto: percentualDesconto,
            parcelas: parcelas
        };
    }

    function exibirResultados(result, aluguel, meses) {
        document.getElementById('valorAntecipado').textContent = formatCurrency(result.valorAntecipado);
        document.getElementById('valorTotal').textContent = formatCurrency(result.valorTotal);
        document.getElementById('desconto').textContent = '- ' + formatCurrency(result.desconto);
        document.getElementById('percentual').textContent = result.percentualDesconto.toFixed(2).replace('.', ',') + '%';

        var tbody = document.querySelector('#tabelaDetalhamento tbody');
        tbody.innerHTML = '';

        // Remove old tfoot if present
        var oldTfoot = document.querySelector('#tabelaDetalhamento tfoot');
        if (oldTfoot) oldTfoot.remove();

        result.parcelas.forEach(function (p) {
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' + p.mes + '</td>' +
                '<td>' + formatCurrency(p.aluguel) + '</td>' +
                '<td>' + p.fator.toFixed(6).replace('.', ',') + '</td>' +
                '<td>' + formatCurrency(p.valorPresente) + '</td>';
            tbody.appendChild(tr);
        });

        // Add totals row in tfoot
        var tfoot = document.createElement('tfoot');
        var trTotal = document.createElement('tr');
        trTotal.innerHTML =
            '<td>Total</td>' +
            '<td>' + formatCurrency(result.valorTotal) + '</td>' +
            '<td></td>' +
            '<td>' + formatCurrency(result.valorAntecipado) + '</td>';
        tfoot.appendChild(trTotal);
        document.getElementById('tabelaDetalhamento').appendChild(tfoot);

        resultsPanel.classList.add('visible');
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function formatCurrency(value) {
        return 'R$ ' + value.toFixed(2)
            .replace('.', ',')
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function parseCurrency(str) {
        if (!str) return NaN;
        var cleaned = str.replace(/\./g, '').replace(',', '.');
        return parseFloat(cleaned);
    }

    function parseRate(str) {
        if (!str) return NaN;
        var cleaned = str.replace(',', '.');
        var percent = parseFloat(cleaned);
        return percent / 100;
    }

    function showError(input, message) {
        var wrapper = input.closest('.input-wrapper');
        wrapper.classList.add('error');

        var existing = wrapper.parentElement.querySelector('.error-message');
        if (!existing) {
            var span = document.createElement('span');
            span.className = 'error-message show';
            span.textContent = message;
            wrapper.parentElement.appendChild(span);
        }
    }

    function clearErrors() {
        document.querySelectorAll('.input-wrapper.error').forEach(function (el) {
            el.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(function (el) {
            el.remove();
        });
    }
});
