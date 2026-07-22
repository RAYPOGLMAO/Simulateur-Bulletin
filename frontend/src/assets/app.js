document.addEventListener('DOMContentLoaded', function () {
  function waitForElementsRetry() {
    var interval = setInterval(function () {
      var saveBtn = document.getElementById('saveSimulationButton');
      if (saveBtn) {
        clearInterval(interval);
        initApp();
      }
    }, 100);
  }

  function initApp() {
    var byId = function (id) { return document.getElementById(id); };
    var formatDT = function (n) { return n.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT'; };
    var API = 'http://localhost:3000/api/simulations';
    var AUTH_API = 'http://localhost:3000/api/auth';

    var currentUser = null;
    var authToken = localStorage.getItem('paiesim_token');

    function authHeaders() {
      var headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = 'Bearer ' + authToken;
      return headers;
    }

    function authFetch(url, options) {
      options = options || {};
      options.headers = options.headers || {};
      if (authToken) options.headers['Authorization'] = 'Bearer ' + authToken;
      if (!options.headers['Content-Type'] && (options.method === 'POST' || options.method === 'PUT')) {
        options.headers['Content-Type'] = 'application/json';
      }
      return fetch(url, options);
    }

    function setLoggedIn(user, token) {
      currentUser = user;
      authToken = token;
      localStorage.setItem('paiesim_token', token);
      localStorage.setItem('paiesim_user', JSON.stringify(user));
      showAuthState();
    }

    function setLoggedOut() {
      currentUser = null;
      authToken = null;
      localStorage.removeItem('paiesim_token');
      localStorage.removeItem('paiesim_user');
      showAuthState();
      byId('payslipOutput').innerHTML = '<div class="payslip-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg><p>Renseignez les informations et cliquez sur "Calculer le bulletin" pour afficher le détail.</p></div>';
      byId('payslipActions').style.display = 'none';
      byId('saveSimulationButton').disabled = true;
      lastComputedInput = null;
      lastComputedResult = null;
    }

    function showAuthState() {
      if (currentUser) {
        byId('signInButton').style.display = 'none';
        byId('signUpButton').style.display = 'none';
        byId('accountPill').style.display = 'flex';
        var initial = currentUser.name ? currentUser.name[0].toUpperCase() : 'U';
        byId('accountAvatar').textContent = initial;
        byId('accountAvatar').style.backgroundImage = '';
        byId('accountName').textContent = currentUser.name;
      } else {
        byId('signInButton').style.display = '';
        byId('signUpButton').style.display = '';
        byId('accountPill').style.display = 'none';
      }
    }

    function showToast(message) {
      var toast = byId('notificationToast');
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toast._hideTimer);
      toast._hideTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }

    function switchView(viewName) {
      var goingToHistory = viewName === 'history';
      byId('simulationView').classList.toggle('active', !goingToHistory);
      byId('historyView').classList.toggle('active', goingToHistory);
      byId('tabSimulation').classList.toggle('active', !goingToHistory);
      byId('tabHistory').classList.toggle('active', goingToHistory);
      if (goingToHistory) renderHistory(byId('historySearchInput').value.trim());
    }

    byId('historySearchInput').addEventListener('input', function (e) {
      if (!byId('historyView').classList.contains('active')) switchView('history');
      renderHistory(e.target.value.trim());
    });

    function computePayslip(input) {
      var baseSalary = input.baseSalary;
      var taxableBonuses = input.taxableBonuses;
      var exemptAllowances = input.exemptAllowances;
      var overtimeHours = input.overtimeHours;
      var overtimeRate = input.overtimeRate;
      var dependentChildren = input.dependentChildren;
      var familyStatus = input.familyStatus;
      var cnssRate = input.cnssRate;

      var LEGAL_MONTHLY_HOURS = 173.33;
      var hourlyRate = baseSalary / LEGAL_MONTHLY_HOURS;
      var overtimeAmount = overtimeHours * hourlyRate * (1 + overtimeRate);

      var cnssBase = baseSalary + taxableBonuses + overtimeAmount;
      var cnssContribution = cnssBase * (cnssRate / 100);

      var taxableGross = cnssBase - cnssContribution;

      var FLAT_DEDUCTION_RATE = 0.10;
      var FLAT_DEDUCTION_MONTHLY_CAP = 2000 / 12;
      var flatDeduction = Math.min(taxableGross * FLAT_DEDUCTION_RATE, FLAT_DEDUCTION_MONTHLY_CAP);

      var HEAD_OF_FAMILY_MONTHLY = 300 / 12;
      var PER_CHILD_MONTHLY = 100 / 12;
      var countedChildren = Math.min(dependentChildren, 4);
      var familyDeduction =
        (familyStatus === 'marie' ? HEAD_OF_FAMILY_MONTHLY : 0) + countedChildren * PER_CHILD_MONTHLY;

      var monthlyTaxableBase = Math.max(0, taxableGross - flatDeduction - familyDeduction);
      var yearlyTaxableBase = monthlyTaxableBase * 12;

      var taxBrackets = [
        { min: 0,     max: 5000,     rate: 0    },
        { min: 5000,  max: 10000,    rate: 0.26 },
        { min: 10000, max: 20000,    rate: 0.28 },
        { min: 20000, max: 30000,    rate: 0.32 },
        { min: 30000, max: 50000,    rate: 0.35 },
        { min: 50000, max: Infinity, rate: 0.40 }
      ];
      var yearlyIncomeTax = 0;
      for (var i = 0; i < taxBrackets.length; i++) {
        var bracket = taxBrackets[i];
        if (yearlyTaxableBase > bracket.min) {
          var portionInBracket = Math.min(yearlyTaxableBase, bracket.max) - bracket.min;
          yearlyIncomeTax += portionInBracket * bracket.rate;
        }
      }
      var monthlyIncomeTax = yearlyIncomeTax / 12;

      var SOLIDARITY_CONTRIBUTION_RATE = 0.01;
      var solidarityContribution = monthlyIncomeTax > 0 ? monthlyTaxableBase * SOLIDARITY_CONTRIBUTION_RATE : 0;

      var grossTotal = baseSalary + taxableBonuses + overtimeAmount + exemptAllowances;
      var totalDeductions = cnssContribution + monthlyIncomeTax + solidarityContribution;
      var netSalary = grossTotal - cnssContribution - monthlyIncomeTax - solidarityContribution;

      return {
        hourlyRate: hourlyRate, overtimeAmount: overtimeAmount, cnssBase: cnssBase,
        cnssContribution: cnssContribution, taxableGross: taxableGross, flatDeduction: flatDeduction,
        familyDeduction: familyDeduction, monthlyTaxableBase: monthlyTaxableBase,
        yearlyTaxableBase: yearlyTaxableBase, yearlyIncomeTax: yearlyIncomeTax,
        monthlyIncomeTax: monthlyIncomeTax, solidarityContribution: solidarityContribution,
        grossTotal: grossTotal, totalDeductions: totalDeductions, netSalary: netSalary
      };
    }

    function readFormInputs() {
      return {
        employeeName: byId('employeeName').value.trim() || 'Salarié(e)',
        familyStatus: byId('familyStatus').value,
        dependentChildren: parseInt(byId('dependentChildren').value) || 0,
        baseSalary: parseFloat(byId('baseSalary').value) || 0,
        taxableBonuses: parseFloat(byId('taxableBonuses').value) || 0,
        exemptAllowances: parseFloat(byId('exemptAllowances').value) || 0,
        overtimeHours: parseFloat(byId('overtimeHours').value) || 0,
        overtimeRate: parseFloat(byId('overtimeRate').value) || 0,
        cnssRate: parseFloat(byId('cnssRate').value) || 0
      };
    }

    function applyInputsToForm(input) {
      byId('employeeName').value = input.employeeName === 'Salarié(e)' ? '' : input.employeeName;
      byId('familyStatus').value = input.familyStatus;
      byId('dependentChildren').value = input.dependentChildren;
      byId('baseSalary').value = input.baseSalary;
      byId('taxableBonuses').value = input.taxableBonuses;
      byId('exemptAllowances').value = input.exemptAllowances;
      byId('overtimeHours').value = input.overtimeHours;
      byId('overtimeRate').value = input.overtimeRate;
      byId('cnssRate').value = input.cnssRate;
    }

    function renderPayslip(input, result, displayDate) {
      var dateStr = displayDate || new Date().toLocaleDateString('fr-FR');
      return '<div class="payslip-tag">Bulletin de <b>' + input.employeeName + '</b> · ' + dateStr + '</div>' +
        '<div class="payslip-line"><span class="label">Salaire de base</span><span class="amount">' + formatDT(input.baseSalary) + '</span></div>' +
        '<div class="payslip-line"><span class="label">Primes / indemnités imposables</span><span class="amount">' + formatDT(input.taxableBonuses) + '</span></div>' +
        '<div class="payslip-line"><span class="label">Heures supplémentaires<small>' + input.overtimeHours + ' h à ' + (input.overtimeRate * 100).toFixed(0) + '%</small></span><span class="amount">' + formatDT(result.overtimeAmount) + '</span></div>' +
        '<div class="payslip-line"><span class="label">Indemnités non imposables</span><span class="amount">' + formatDT(input.exemptAllowances) + '</span></div>' +
        '<div class="payslip-line grand-total"><span class="label">Salaire brut total</span><span class="amount">' + formatDT(result.grossTotal) + '</span></div>' +
        '<div class="section-divider">Retenues</div>' +
        '<div class="payslip-line deduction"><span class="label">Cotisation CNSS<small>' + input.cnssRate + '% de ' + formatDT(result.cnssBase) + '</small></span><span class="amount">− ' + formatDT(result.cnssContribution) + '</span></div>' +
        '<div class="payslip-line"><span class="label">Abattement forfaitaire (frais pro.)</span><span class="amount">− ' + formatDT(result.flatDeduction) + '</span></div>' +
        '<div class="payslip-line"><span class="label">Déductions familiales<small>' + (input.familyStatus === 'marie' ? 'Chef de famille + ' : '') + Math.min(input.dependentChildren, 4) + ' enfant(s)</small></span><span class="amount">− ' + formatDT(result.familyDeduction) + '</span></div>' +
        '<div class="payslip-line"><span class="label">Base imposable mensuelle</span><span class="amount">' + formatDT(result.monthlyTaxableBase) + '</span></div>' +
        '<div class="payslip-line deduction"><span class="label">Impôt sur le revenu (IRPP)<small>Barème progressif annualisé</small></span><span class="amount">− ' + formatDT(result.monthlyIncomeTax) + '</span></div>' +
        '<div class="payslip-line deduction"><span class="label">Contribution sociale de solidarité (CSS)</span><span class="amount">− ' + formatDT(result.solidarityContribution) + '</span></div>' +
        '<div class="payslip-line grand-total"><span class="label">Salaire net à payer</span><span class="amount">' + formatDT(result.netSalary) + '</span></div>';
    }

    var lastComputedInput = null;
    var lastComputedResult = null;

    byId('calculateButton').addEventListener('click', function () {
      var input = readFormInputs();
      if (input.baseSalary <= 0) { showToast('Veuillez saisir un salaire de base valide.'); return; }
      var result = computePayslip(input);
      byId('payslipOutput').innerHTML = renderPayslip(input, result);
      byId('payslipActions').style.display = 'flex';
      lastComputedInput = input;
      lastComputedResult = result;
      byId('saveSimulationButton').disabled = false;
    });

    byId('copyNetButton').addEventListener('click', function () {
      if (!lastComputedResult) return;
      navigator.clipboard.writeText(formatDT(lastComputedResult.netSalary)).then(function () {
        showToast('Salaire net copié dans le presse-papiers.');
      }).catch(function () {
        showToast("Impossible de copier automatiquement.");
      });
    });

    byId('printPayslipButton').addEventListener('click', function () { window.print(); });

    function updateHistoryStats(list) {
      byId('statCount').textContent = list.length;
      if (!list.length) {
        byId('statAverage').textContent = '—';
        byId('statMax').textContent = '—';
        return;
      }
      var netValues = list.map(function (item) { return (item.result && item.result.netSalary) || 0; });
      var sum = 0;
      for (var i = 0; i < netValues.length; i++) sum += netValues[i];
      var average = sum / netValues.length;
      var max = Math.max.apply(null, netValues);
      byId('statAverage').textContent = formatDT(average);
      byId('statMax').textContent = formatDT(max);
    }

    function formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleString('fr-FR');
    }

    function renderHistory(searchTerm) {
      if (!currentUser) {
        byId('historyTableWrapper').innerHTML = '<div class="empty-state">Connectez-vous pour voir vos simulations.</div>';
        updateHistoryStats([]);
        return;
      }
      searchTerm = searchTerm || '';
      authFetch(API).then(function (res) {
        if (!res.ok) throw new Error('Not ok');
        return res.json();
      }).then(function (fullList) {
        updateHistoryStats(fullList);

        var filteredList = searchTerm
          ? fullList.filter(function (item) { return ((item.input && item.input.employeeName) || '').toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1; })
          : fullList;

        var wrapper = byId('historyTableWrapper');
        if (!fullList.length) {
          wrapper.innerHTML = '<div class="empty-state">Aucune simulation enregistrée pour le moment.</div>';
          return;
        }
        if (!filteredList.length) {
          wrapper.innerHTML = '<div class="empty-state">Aucun résultat pour « ' + searchTerm + ' ».</div>';
          return;
        }

        var rows = filteredList.map(function (item) {
          var net = (item.result && item.result.netSalary) || 0;
          var gross = (item.result && item.result.grossTotal) || 0;
          var name = (item.input && item.input.employeeName) || item.employee_name || '';
          return '<tr>' +
            '<td>' + formatDate(item.created_at) + '</td>' +
            '<td>' + name + '</td>' +
            '<td class="cell-brut">' + formatDT(gross) + '</td>' +
            '<td class="cell-net">' + formatDT(net) + '</td>' +
            '<td><div class="row-actions">' +
            '<button class="icon-btn" data-view="' + item.id + '" title="Voir le détail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>' +
            '<button class="icon-btn" data-reuse="' + item.id + '" title="Reprendre cette simulation"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 106 5.3L3 8"/></svg></button>' +
            '<button class="icon-btn danger" data-delete="' + item.id + '" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>' +
            '</div></td></tr>';
        }).join('');

        wrapper.innerHTML = '<table><thead><tr><th>Date</th><th>Salarié</th><th>Brut</th><th>Net</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';

        wrapper.querySelectorAll('[data-view]').forEach(function (btn) { btn.addEventListener('click', function () { openHistoryDetail(btn.dataset.view); }); });
        wrapper.querySelectorAll('[data-reuse]').forEach(function (btn) { btn.addEventListener('click', function () { reuseHistoryItem(btn.dataset.reuse); }); });
        wrapper.querySelectorAll('[data-delete]').forEach(function (btn) { btn.addEventListener('click', function () { deleteHistoryItem(btn.dataset.delete); }); });
      }).catch(function () {
        byId('historyTableWrapper').innerHTML = '<div class="empty-state">Impossible de contacter le serveur.</div>';
        updateHistoryStats([]);
      });
    }

    function openHistoryDetail(id) {
      authFetch(API + '/' + id).then(function (res) {
        if (!res.ok) throw new Error('Not ok');
        return res.json();
      }).then(function (item) {
        byId('detailModalBody').innerHTML = renderPayslip(item.input, item.result, formatDate(item.created_at));
        byId('detailModal').classList.add('show');
      }).catch(function () { showToast("Erreur lors du chargement du détail."); });
    }

    byId('closeDetailModal').addEventListener('click', function () { byId('detailModal').classList.remove('show'); });
    byId('detailModal').addEventListener('click', function (e) { if (e.target === e.currentTarget) e.currentTarget.classList.remove('show'); });

    function reuseHistoryItem(id) {
      authFetch(API + '/' + id).then(function (res) {
        if (!res.ok) throw new Error('Not ok');
        return res.json();
      }).then(function (item) {
        applyInputsToForm(item.input);
        switchView('simulation');
        showToast('Simulation rechargée dans le formulaire.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }).catch(function () { showToast("Erreur lors du chargement."); });
    }

    function deleteHistoryItem(id) {
      authFetch(API + '/' + id, { method: 'DELETE' }).then(function () {
        renderHistory(byId('historySearchInput').value.trim());
        showToast('Simulation supprimée.');
      }).catch(function () { showToast("Erreur lors de la suppression."); });
    }

    byId('clearHistoryButton').addEventListener('click', function () {
      if (confirm("Vider tout l'historique des simulations ?")) {
        authFetch(API, { method: 'DELETE' }).then(function () {
          renderHistory();
          showToast('Historique vidé.');
        }).catch(function () { showToast("Erreur lors du vidage."); });
      }
    });

    byId('saveSimulationButton').addEventListener('click', function () {
      if (!currentUser) {
        showToast('Connectez-vous pour enregistrer.');
        openAuth('signin');
        return;
      }
      if (!lastComputedInput || !lastComputedResult) return;
      authFetch(API, {
        method: 'POST',
        body: JSON.stringify({ input: lastComputedInput, result: lastComputedResult })
      }).then(function (res) {
        if (!res.ok) throw new Error('Not ok');
        renderHistory(byId('historySearchInput').value.trim());
        showToast("Simulation enregistrée dans l'historique.");
      }).catch(function () { showToast("Impossible de contacter le serveur."); });
    });

    var uploadedAvatarDataUrl = null;

    byId('avatarUploadButton').addEventListener('click', function () { byId('avatarFileInput').click(); });
    byId('avatarFileInput').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { showToast('Merci de choisir un fichier image.'); return; }
      var reader = new FileReader();
      reader.onload = function () {
        uploadedAvatarDataUrl = reader.result;
        byId('avatarPreviewImage').src = uploadedAvatarDataUrl;
        byId('avatarPreviewImage').style.display = 'block';
        byId('avatarPlaceholderIcon').style.display = 'none';
      };
      reader.readAsDataURL(file);
    });

    function openAuth(view) {
      switchAuthView(view);
      byId('authModal').classList.add('show');
    }
    function closeAuth() { byId('authModal').classList.remove('show'); }
    function switchAuthView(view) {
      byId('authSignInView').style.display = view === 'signin' ? 'block' : 'none';
      byId('authSignUpView').style.display = view === 'signup' ? 'block' : 'none';
    }
    function togglePasswordField(inputId, btn) {
      var input = byId(inputId);
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.style.color = input.type === 'text' ? 'var(--accent)' : '';
    }

    window.loginWith = function () {
      var email = byId('signInEmail').value.trim();
      var password = byId('signInPassword').value;

      if (!email || !password) {
        showToast('Veuillez remplir tous les champs.');
        return;
      }

      fetch(AUTH_API + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      }).then(function (res) {
        if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || 'Erreur'); });
        return res.json();
      }).then(function (data) {
        setLoggedIn(data.user, data.token);
        closeAuth();
        renderHistory();
        showToast('Connexion réussie. Bienvenue ' + data.user.name + ' !');
      }).catch(function (err) {
        showToast(err.message || 'Erreur de connexion.');
      });
    };

    window.registerWith = function () {
      var name = byId('signUpName').value.trim();
      var email = byId('signUpEmail').value.trim();
      var password = byId('signUpPassword').value;

      if (!name || !email || !password) {
        showToast('Veuillez remplir tous les champs.');
        return;
      }

      fetch(AUTH_API + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, password: password })
      }).then(function (res) {
        if (!res.ok) return res.json().then(function (d) { throw new Error(d.error || 'Erreur'); });
        return res.json();
      }).then(function (data) {
        setLoggedIn(data.user, data.token);
        closeAuth();
        renderHistory();
        showToast('Compte créé. Bienvenue ' + data.user.name + ' !');
      }).catch(function (err) {
        showToast(err.message || "Erreur d'inscription.");
      });
    };

    window.logOut = function () {
      setLoggedOut();
      renderHistory();
      showToast('Vous êtes déconnecté.');
    };

    window.switchView = switchView;
    window.openAuth = openAuth;
    window.closeAuth = closeAuth;
    window.switchAuthView = switchAuthView;
    window.togglePasswordField = togglePasswordField;

    byId('authModal').addEventListener('click', function (e) { if (e.target === e.currentTarget) closeAuth(); });

    // On load: check for stored token
    if (authToken) {
      authFetch(AUTH_API + '/me').then(function (res) {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      }).then(function (user) {
        currentUser = user;
        showAuthState();
        renderHistory();
      }).catch(function () {
        setLoggedOut();
      });
    } else {
      showAuthState();
    }
  }

  waitForElementsRetry();
});
