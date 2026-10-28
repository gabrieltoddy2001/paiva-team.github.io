import { api, dataMode, apiConfiguration } from './api-client.js';

const view = document.querySelector('#view');
const modalRoot = document.querySelector('#modal-root');
const toastStack = document.querySelector('#toast-stack');
const pageTitle = document.querySelector('#page-title');
const pageEyebrow = document.querySelector('#header-eyebrow');
const sidebar = document.querySelector('#sidebar');
const sidebarBackdrop = document.querySelector('#sidebar-backdrop');

const pageMeta = {
  dashboard: { title: 'Dashboard', eyebrow: 'OPERAÇÃO DO DIA' },
  alunos: { title: 'Alunos', eyebrow: 'GESTÃO DE CADASTROS' },
  turmas: { title: 'Turmas', eyebrow: 'AGENDA E TREINOS' },
  financeiro: { title: 'Financeiro', eyebrow: 'RECEBIMENTOS E COBRANÇAS' },
  presenca: { title: 'Presença', eyebrow: 'CHAMADA DE AULA' },
  graduacoes: { title: 'Graduações', eyebrow: 'PROGRESSÃO TÉCNICA' },
  relatorios: { title: 'Relatórios', eyebrow: 'ANÁLISE GERENCIAL' },
  configuracoes: { title: 'Configurações', eyebrow: 'AMBIENTE ADMINISTRATIVO' }
};

const state = {
  page: location.hash.slice(1) in pageMeta ? location.hash.slice(1) : 'dashboard',
  studentQuery: '',
  studentStatus: 'Todos',
  attendanceClass: 't01',
  attendanceDate: '2026-10-27',
  attendanceRecords: [],
  attendanceLoadedKey: ''
};

let studentSearchTimer;

const escapeHTML = (str) => {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
  );
};

const icon = (name, className = '') => `<svg class="${className}"><use href="#icon-${name}" /></svg>`;
const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const shortDate = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '');
const initials = (name) => name.split(' ').slice(0, 2).map((item) => item[0]).join('').toUpperCase();

function statusClass(status) {
  const map = { 
    Paga: 'paid', Pendente: 'pending', Vencida: 'overdue', 
    Ativo: 'active', Ativa: 'active', Inativo: 'inactive', Encerrada: 'inactive', 
    Presente: 'present', Ausente: 'absent', Regular: 'active', Trancada: 'inactive' 
  };
  return map[status] || 'info';
}

function status(statusText) { 
  return `<span class="status ${statusClass(statusText)}">${statusText}</span>`; 
}

function avatar(student, size = '') { 
  return `<span class="avatar ${student.color || 'lime'} ${size}">${escapeHTML(student.initials || initials(student.name))}</span>`; 
}

function loading() { 
  view.innerHTML = '<div class="loading">Atualizando dados do painel...</div>'; 
}

function toast(title, message, type = 'success') {
  const element = document.createElement('div');
  element.className = `toast ${type === 'error' ? 'error' : ''}`;
  element.innerHTML = `${icon(type === 'error' ? 'info' : 'shield')}<div><b>${escapeHTML(title)}</b><span>${escapeHTML(message)}</span></div>`;
  toastStack.append(element);
  setTimeout(() => element.remove(), 4200);
}

function openModal(content) {
  modalRoot.classList.add('open');
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal"></div>${content}`;
}

function closeModal() { 
  modalRoot.classList.remove('open'); 
  modalRoot.innerHTML = ''; 
}

function panelHeader(title, action, actionText = 'Ver todos') {
  return `
    <div class="panel-header">
      <h3>${escapeHTML(title)}</h3>
      ${action ? `<button class="panel-link" data-page="${action}">${actionText}${icon('chevron')}</button>` : ''}
    </div>`;
}

function emptyState(title, text) { 
  return `<div class="empty-state">${icon('info')}<h3>${escapeHTML(title)}</h3><p>${escapeHTML(text)}</p></div>`; 
}

async function renderDashboard() {
  loading();
  const data = await api.getDashboard();
  const collectionRate = data.collectionTarget ? Math.round((data.received / data.collectionTarget) * 100) : 0;
  
  view.innerHTML = `
    <div class="dashboard-greeting">
      <div>
        <h2>Seu dojo em movimento.</h2>
        <p>Terça-feira, 27 de outubro · Acompanhe a operação antes do próximo treino.</p>
      </div>
      <div class="live-status"><i></i> Dados atualizados agora</div>
    </div>
    
    <section class="metric-grid">
      <article class="metric-card">
        <div class="metric-top"><span class="metric-label">Alunos ativos</span><span class="metric-icon lime">${icon('users')}</span></div>
        <strong class="metric-value">${data.active}</strong>
        <div class="metric-footer">Cadastros em situação ativa</div>
      </article>
      <article class="metric-card">
        <div class="metric-top"><span class="metric-label">Alunos inativos</span><span class="metric-icon red">${icon('users')}</span></div>
        <strong class="metric-value">${data.inactive}</strong>
        <div class="metric-footer negative">Histórico preservado</div>
      </article>
      <article class="metric-card">
        <div class="metric-top"><span class="metric-label">Mensalidades pagas</span><span class="metric-icon blue">${icon('wallet')}</span></div>
        <strong class="metric-value">${data.paid}</strong>
        <div class="metric-footer"><strong>${collectionRate}%</strong> da previsão mensal</div>
      </article>
      <article class="metric-card">
        <div class="metric-top"><span class="metric-label">Pendentes</span><span class="metric-icon orange">${icon('calendar')}</span></div>
        <strong class="metric-value">${data.pending}</strong>
        <div class="metric-footer negative"><strong>${data.overdue} vencida${data.overdue === 1 ? '' : 's'}</strong> requer atenção</div>
      </article>
      <article class="metric-card">
        <div class="metric-top"><span class="metric-label">Recebido em outubro</span><span class="metric-icon lime">${icon('chart')}</span></div>
        <strong class="metric-value">${money(data.received)}</strong>
        <div class="metric-footer">Somente pagamentos registrados</div>
      </article>
    </section>

    <section class="dashboard-columns">
      <div class="stack-gap">
        <article class="panel">
          ${panelHeader('Próximos vencimentos', 'financeiro', 'Abrir financeiro')}
          <div class="table-scroll">
            <table class="list-table">
              <thead><tr><th>Aluno</th><th>Vencimento</th><th>Valor</th><th>Status</th></tr></thead>
              <tbody>
                ${data.upcoming.map((charge) => `
                  <tr>
                    <td>
                      <div class="student-cell">
                        ${avatar({ name: charge.student, color: ['orange', 'violet', 'blue', 'pink'][charge.studentId.charCodeAt(2) % 4] })}
                        <div><strong>${escapeHTML(charge.student)}</strong><small>${escapeHTML(charge.plan)}</small></div>
                      </div>
                    </td>
                    <td>${shortDate(charge.due)}</td>
                    <td>${money(charge.originalAmount || charge.amount)}</td>
                    <td>${status(charge.status)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </article>
        
        <article class="panel dashboard-activity">
          ${panelHeader('Matrículas recentes', 'alunos', 'Ver alunos')}
          <div class="activity-list">
            ${data.recentStudents.map((student) => `
              <div class="activity">
                <span class="activity-icon">${icon('users')}</span>
                <div><strong>${escapeHTML(student.name)}</strong><small>${escapeHTML(student.plan)} · ${escapeHTML(student.className)}</small></div>
                <time>${shortDate(student.enrollmentDate)}</time>
              </div>
            `).join('')}
          </div>
        </article>
      </div>

      <div class="stack-gap">
        <article class="panel revenue-card">
          <span class="revenue-eyebrow">RECEBIMENTOS DO MÊS</span>
          <h3>${money(data.received)}</h3>
          <p>Previsão gerada para outubro: ${money(data.collectionTarget)}</p>
          <div class="progress-track"><i style="width:${collectionRate}%"></i></div>
          <div class="revenue-row">
            <span>${collectionRate}% recebido</span>
            <strong>Em aberto ${money(data.outstanding)}</strong>
          </div>
        </article>
        
        <article class="panel">
          ${panelHeader('Ações rápidas')}
          <div class="quick-actions">
            <button class="quick-action" data-action="open-student"><span class="quick-icon">${icon('plus')}</span><span><b>Cadastrar aluno</b><small>Nova matrícula</small></span></button>
            <button class="quick-action" data-action="open-payment"><span class="quick-icon">${icon('wallet')}</span><span><b>Registrar pagamento</b><small>Baixar cobrança</small></span></button>
            <button class="quick-action" data-page="presenca"><span class="quick-icon">${icon('checklist')}</span><span><b>Registrar presença</b><small>Chamada de hoje</small></span></button>
            <button class="quick-action" data-page="turmas"><span class="quick-icon">${icon('calendar')}</span><span><b>Consultar turmas</b><small>Horários e alunos</small></span></button>
          </div>
        </article>
      </div>
    </section>`;
}

async function renderStudents() {
  loading();
  const [students, allStudents] = await Promise.all([
    api.getStudents({ query: state.studentQuery, status: state.studentStatus }), 
    api.getStudents()
  ]);
  
  const rows = students.length ? students.map((student) => `
    <tr>
      <td>
        <div class="student-cell">
          ${avatar(student)}
          <div><strong>${escapeHTML(student.name)}</strong><small>${escapeHTML(student.phone)}</small></div>
        </div>
      </td>
      <td><span>${escapeHTML(student.plan)}</span><small class="muted">Venc. dia 10</small></td>
      <td>${escapeHTML(student.className)}</td>
      <td>${status(student.status)}</td>
      <td>${status(student.enrollmentStatus)}</td>
      <td class="actions-cell">
        <button class="more-button" title="Editar aluno" data-action="edit-student" data-id="${student.id}">${icon('pencil')}</button>
        <button class="more-button" title="Alterar situação" data-action="toggle-student" data-id="${student.id}">${icon('more')}</button>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6">${emptyState('Nenhum aluno encontrado', 'Ajuste os filtros ou cadastre um novo aluno.')}</td></tr>`;

  view.innerHTML = `
    <div class="page-intro">
      <div>
        <h2>Alunos & matrículas</h2>
        <p>Cadastros, planos e situação de matrícula em um só lugar.</p>
      </div>
      <div class="toolbar">
        <label class="search-field">${icon('search')}<input id="student-search" value="${escapeHTML(state.studentQuery)}" placeholder="Buscar por nome ou telefone" /></label>
        <button class="secondary-button" data-action="download-report">${icon('download')} Exportar</button>
        <button class="primary-button" data-action="open-student">${icon('plus')} Novo aluno</button>
      </div>
    </div>
    
    <div class="filter-row">
      <span class="filter-label">Situação:</span>
      ${['Todos', 'Ativo', 'Inativo'].map((item) => {
        const total = item === 'Todos' ? allStudents.length : allStudents.filter((student) => student.status === item).length;
        return `<button class="filter-chip ${state.studentStatus === item ? 'active' : ''}" data-action="student-filter" data-status="${item}">${item} <b>${total}</b></button>`;
      }).join('')}
    </div>

    <article class="panel table-panel">
      <div class="table-scroll">
        <table class="list-table data-table">
          <thead><tr><th>Aluno</th><th>Plano</th><th>Turma principal</th><th>Cadastro</th><th>Matrícula</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="student-info">
        <span>
          <b>${students.length} aluno${students.length === 1 ? '' : 's'} listado${students.length === 1 ? '' : 's'}</b>
          <span>Cadastro e matrícula possuem situações independentes.</span>
        </span>
        <div class="alert-inline">${icon('info')} Histórico preservado ao inativar</div>
      </div>
    </article>`;
}

async function renderClasses() {
  loading();
  const [classes, students] = await Promise.all([api.getClasses(), api.getStudents()]);
  
  view.innerHTML = `
    <div class="page-intro">
      <div><h2>Turmas & horários</h2><p>Organize os treinos, responsáveis e capacidade da sua academia.</p></div>
      <div class="toolbar">
        <button class="secondary-button" data-action="class-calendar">${icon('calendar')} Ver agenda</button>
        <button class="primary-button" data-action="open-class">${icon('plus')} Nova turma</button>
      </div>
    </div>
    
    <section class="class-grid">
      ${classes.map((group) => {
        const accents = { lime: ['#c7f11c','#eff9c6','#718c00'], blue: ['#6d94e8','#eaf0ff','#5576bd'], orange: ['#faad3d','#fff1d8','#c47b15'], violet: ['#9c81dc','#efeaff','#7257b7'] };
        const [accent, soft, dark] = accents[group.color] || accents.lime;
        return `
          <article class="panel class-card" style="--card-accent:${accent};--accent-soft:${soft};--accent-dark:${dark}">
            <div class="class-card-top">
              <div><h3>${escapeHTML(group.name)}</h3><p>${escapeHTML(group.type)}</p></div>
              <span class="class-accent">${icon('calendar')}</span>
            </div>
            <dl>
              <div><dt>Dias</dt><dd>${escapeHTML(group.days)}</dd></div>
              <div><dt>Horário</dt><dd>${escapeHTML(group.time)}</dd></div>
              <div><dt>Responsável</dt><dd>${escapeHTML(group.teacher)}</dd></div>
              <div><dt>Situação</dt><dd>${status(group.status)}</dd></div>
            </dl>
            <div class="capacity">
              <div class="member-avatars">
                ${group.students.map((id) => { 
                  const item = students.find((student) => student.id === id) || { initials: id.toUpperCase(), color: 'blue' }; 
                  return avatar(item); 
                }).join('')}
              </div>
              <span><strong>${group.enrolled}</strong> de ${group.capacity} vagas</span>
            </div>
            <div class="class-footer">
              <button data-action="class-members" data-id="${group.id}">Ver participantes</button>
              <button data-action="edit-class" data-id="${group.id}">${icon('pencil')} Editar</button>
              ${group.status === 'Ativa' ? `<button data-action="close-class" data-id="${group.id}">Encerrar</button>` : ''}
            </div>
          </article>
        `;
      }).join('')}
    </section>`;
}

async function renderFinance() {
  loading();
  const data = await api.getFinancialOverview();
  
  const chargeRows = data.charges.map((charge) => `
    <tr>
      <td>
        <div class="student-cell">
          ${avatar({ name: charge.student, color: ['orange','violet','blue','pink'][charge.studentId.charCodeAt(2) % 4] })}
          <div><strong>${escapeHTML(charge.student)}</strong><small>${escapeHTML(charge.plan)}</small></div>
        </div>
      </td>
      <td>${shortDate(charge.due)}</td>
      <td>${money(charge.originalAmount || charge.amount)}</td>
      <td>${status(charge.status)}</td>
      <td>${charge.method || '—'}</td>
      <td class="actions-cell">
        ${charge.status !== 'Paga' 
          ? `<button class="secondary-button" data-action="open-payment" data-charge-id="${charge.id}">Registrar</button>` 
          : `<span class="muted">${money(charge.paidAmount || 0)} recebido</span>`}
      </td>
    </tr>
  `).join('');

  view.innerHTML = `
    <div class="page-intro">
      <div><h2>Financeiro</h2><p>Acompanhe cobranças geradas e pagamentos efetivamente recebidos.</p></div>
      <div class="toolbar">
        <button class="secondary-button" data-action="download-report">${icon('download')} Relatório</button>
        <button class="primary-button" data-action="open-payment">${icon('plus')} Registrar pagamento</button>
      </div>
    </div>
    
    <section class="finance-summary">
      <article class="panel finance-total">
        <p>RECEBIMENTOS REGISTRADOS · OUTUBRO</p>
        <h2>${money(data.received)}</h2>
        <span class="compare"><strong>+12,4%</strong> em relação ao mês anterior</span>
      </article>
      <article class="panel finance-mini">
        <span class="mini-icon orange">${icon('calendar')}</span>
        <h3>${money(data.pendingTotal)}</h3>
        <p>Em cobranças pendentes</p>
      </article>
      <article class="panel finance-mini">
        <span class="mini-icon red">${icon('info')}</span>
        <h3>${money(data.overdueTotal)}</h3>
        <p>Em inadimplência</p>
      </article>
    </section>

    <section class="dashboard-columns">
      <article class="panel table-panel">
        <div class="finance-tabs">
          <button class="finance-tab active">Cobranças</button>
          <button class="finance-tab" data-action="future-tab">Pagamentos</button>
          <button class="finance-tab" data-action="future-tab">Por aluno</button>
        </div>
        <div class="table-scroll">
          <table class="list-table data-table">
            <thead><tr><th>Aluno</th><th>Vencimento</th><th>Valor original</th><th>Status</th><th>Método</th><th></th></tr></thead>
            <tbody>${chargeRows}</tbody>
          </table>
        </div>
      </article>
      
      <article class="panel">
        ${panelHeader('Planos ativos')}
        <div class="plan-list">
          ${data.plans.map((plan) => `
            <div class="plan-row">
              <div class="plan-name"><b>${escapeHTML(plan.name)}</b><span>${escapeHTML(plan.periodicity)} · ${plan.members} alunos</span></div>
              <div class="plan-price"><b>${money(plan.price)}</b><small>Venc. dia ${plan.dueDay}</small></div>
              <button class="secondary-button" data-action="edit-plan" data-id="${plan.id}">Editar</button>
            </div>
          `).join('')}
        </div>
      </article>
    </section>`;
}

async function renderAttendance() {
  loading();
  const [classes, attendance] = await Promise.all([
    api.getClasses(), 
    api.getAttendance(state.attendanceClass, state.attendanceDate)
  ]);
  
  const attendanceKey = `${state.attendanceClass}:${state.attendanceDate}`;
  if (state.attendanceLoadedKey !== attendanceKey) {
    state.attendanceRecords = attendance.records;
    state.attendanceLoadedKey = attendanceKey;
  }
  const records = state.attendanceRecords;
  const presentCount = records.filter((record) => record.status === 'Presente').length;
  const progressWidth = (presentCount / Math.max(records.length, 1)) * 100;

  view.innerHTML = `
    <div class="page-intro">
      <div><h2>Controle de presença</h2><p>Faça a chamada por turma e mantenha o histórico de frequência.</p></div>
      <div class="toolbar">
        <button class="secondary-button" data-action="attendance-history">${icon('chart')} Histórico</button>
      </div>
    </div>
    
    <section class="attendance-layout">
      <article class="panel">
        <div class="panel-header"><h3>Turmas de hoje</h3></div>
        <div class="class-select-list">
          ${classes.map((group) => `
            <button class="select-class ${attendance.group.id === group.id ? 'active' : ''}" data-action="select-attendance-class" data-id="${group.id}">
              <span class="class-mini">${icon('calendar')}</span>
              <span><b>${escapeHTML(group.name)}</b><small>${escapeHTML(group.teacher)}</small></span>
              <time>${escapeHTML(group.time.split(' — ')[0])}</time>
            </button>
          `).join('')}
        </div>
      </article>

      <article class="panel">
        <div class="call-header">
          <div><h3>${escapeHTML(attendance.group.name)}</h3><p>${escapeHTML(attendance.group.days)} · ${escapeHTML(attendance.group.teacher)}</p></div>
          <input class="date-select" id="attendance-date" type="date" value="${state.attendanceDate}" />
        </div>
        
        <div class="attendance-progress">
          <div class="progress-track"><i style="width:${progressWidth}%"></i></div>
          <span><b>${presentCount}</b> presentes de ${records.length}</span>
        </div>
        
        <div class="call-list">
          ${records.map((record) => `
            <div class="call-row">
              <div class="student-cell">
                ${avatar(record.student)}
                <div><strong>${escapeHTML(record.student.name)}</strong><small>${escapeHTML(record.student.belt)}</small></div>
              </div>
              <div class="attendance-choice">
                <button class="choice present ${record.status === 'Presente' ? 'active' : ''}" data-action="attendance-choice" data-id="${record.student.id}" data-status="Presente">Presente</button>
                <button class="choice absent ${record.status === 'Ausente' ? 'active' : ''}" data-action="attendance-choice" data-id="${record.student.id}" data-status="Ausente">Ausente</button>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="call-footer">
          <p>Confira a lista antes de salvar.</p>
          <button class="primary-button" data-action="save-attendance">${icon('checklist')} Salvar chamada</button>
        </div>
      </article>
    </section>`;
}

async function renderGraduations() {
  loading();
  const data = await api.getGraduations();
  
  const entries = data.latest.map((item) => `
    <tr>
      <td>
        <div class="student-cell">
          ${avatar({ name: item.student, color: ['orange', 'green', 'yellow'][item.degrees % 3] })}
          <div><strong>${escapeHTML(item.student)}</strong><small>Graduação registrada</small></div>
        </div>
      </td>
      <td><span class="belt-mini"></span>${escapeHTML(item.belt)}</td>
      <td>${item.degrees}º grau${item.degrees === 1 ? '' : 's'}</td>
      <td>${shortDate(item.date)}</td>
      <td class="muted">${escapeHTML(item.note)}</td>
    </tr>
  `).join('');

  view.innerHTML = `
    <div class="page-intro">
      <div><h2>Faixas & graduações</h2><p>Registre a evolução técnica e preserve cada etapa do atleta.</p></div>
      <div class="toolbar">
        <button class="primary-button" data-action="open-graduation">${icon('plus')} Registrar graduação</button>
      </div>
    </div>
    
    <section class="graduation-layout">
      <div class="stack-gap">
        <article class="panel belt-overview">
          <span class="overview-label">GRADUAÇÃO ATUAL · PERFIL EM DESTAQUE</span>
          <div class="belt-visual">
            <span class="belt-band"></span>
            <div>
              <h2>${escapeHTML(data.featured.belt)} · ${data.featured.degrees} grau${data.featured.degrees === 1 ? '' : 's'}</h2>
              <p>${escapeHTML(data.featured.student)} · desde ${shortDate(data.featured.date)}</p>
            </div>
          </div>
        </article>
        
        <article class="panel">
          ${panelHeader(`Linha do tempo · ${data.featured.student}`)}
          <div class="timeline">
            ${data.timeline.slice().reverse().map((item) => `
              <div class="timeline-item">
                <span class="timeline-marker"></span>
                <div><b>${escapeHTML(item.belt)} · ${item.degrees} grau${item.degrees === 1 ? '' : 's'}</b><p>${escapeHTML(item.note)}</p></div>
                <time>${shortDate(item.date)}</time>
              </div>
            `).join('')}
          </div>
        </article>
      </div>
      
      <article class="panel table-panel graduation-table">
        ${panelHeader('Últimas graduações')}
        <div class="table-scroll">
          <table class="list-table data-table">
            <thead><tr><th>Aluno</th><th>Faixa</th><th>Graus</th><th>Data</th><th>Observação</th></tr></thead>
            <tbody>${entries}</tbody>
          </table>
        </div>
      </article>
    </section>`;
}

async function renderReports() {
  loading();
  const [dashboard, financial, attendance] = await Promise.all([
    api.getDashboard(), 
    api.getFinancialOverview(), 
    api.getAttendance(state.attendanceClass, state.attendanceDate)
  ]);
  
  const collectionValues = [['Recebido', financial.received], ['Pendente', financial.pendingTotal], ['Vencido', financial.overdueTotal]];
  const maximum = Math.max(...collectionValues.map(([, value]) => value), 1);
  const presentCount = attendance.records.filter((record) => record.status === 'Presente').length;
  const attendanceRate = Math.round((presentCount / Math.max(attendance.records.length, 1)) * 100);

  view.innerHTML = `
    <div class="page-intro">
      <div><h2>Relatórios gerenciais</h2><p>Indicadores para acompanhamento da operação.</p></div>
      <div class="toolbar">
        <button class="secondary-button" data-action="download-report">${icon('download')} Exportar dados</button>
      </div>
    </div>
    
    <section class="report-grid">
      <article class="panel chart-card">
        <h3>Situação das cobranças · outubro</h3>
        <p>Valores consolidados a partir das cobranças e pagamentos registrados.</p>
        <div class="bar-chart">
          ${collectionValues.map(([label, value]) => `
            <div class="bar">
              <i style="height:${Math.round((value / maximum) * 100)}%"></i>
              <span>${label}</span>
            </div>
          `).join('')}
        </div>
      </article>
      
      <div class="report-cards">
        <article class="panel report-tile">
          <span class="tile-icon">${icon('wallet')}</span>
          <div><b>Inadimplência</b><p>${dashboard.overdue} cobrança${dashboard.overdue === 1 ? '' : 's'} vencida${dashboard.overdue === 1 ? '' : 's'} · ${money(financial.overdueTotal)}</p></div>
          <button class="secondary-button" data-page="financeiro">Ver</button>
        </article>
        <article class="panel report-tile">
          <span class="tile-icon">${icon('checklist')}</span>
          <div><b>Frequência da aula</b><p>${attendanceRate}% de presença na chamada selecionada</p></div>
          <button class="secondary-button" data-page="presenca">Ver</button>
        </article>
        <article class="panel report-tile">
          <span class="tile-icon">${icon('users')}</span>
          <div><b>Alunos ativos</b><p>${dashboard.active} cadastros em situação ativa</p></div>
          <button class="secondary-button" data-page="alunos">Ver</button>
        </article>
      </div>
    </section>`;
}

function renderSettings() {
  const apiStatus = dataMode === 'api';
  view.innerHTML = `
    <div class="page-intro">
      <div><h2>Configurações</h2><p>Parâmetros de interface e integração do sistema.</p></div>
    </div>
    
    <section class="settings-grid">
      <article class="panel setting-card">
        <h3>Integração de dados</h3>
        <p>O sistema alterna automaticamente entre dados de demonstração e API HTTP.</p>
        
        <div class="setting-row">
          <div><b>Fonte de dados atual</b><span>${apiStatus ? apiConfiguration.apiBaseUrl : 'Dados simulados (memória local)'}</span></div>
          <span class="api-badge ${apiStatus ? 'connected' : ''}">${apiStatus ? 'API conectada' : 'Modo demonstração'}</span>
        </div>
        
        <div class="setting-row">
          <div><b>Como conectar o backend</b><span>Preencha a meta tag <code>api-base-url</code> no arquivo index.html.</span></div>
          <button class="secondary-button" data-action="integration-help">Ver contrato</button>
        </div>
      </article>
      
      <article class="panel setting-card">
        <h3>Segurança & LGPD</h3>
        <p>Estas definições dependem do backend e da infraestrutura escolhida.</p>
        
        <div class="setting-row"><div><b>Login administrativo</b><span>Representação visual nesta versão</span></div>${status('Pendente')}</div>
        <div class="setting-row"><div><b>Auditoria financeira</b><span>Endpoint previsto para registros relevantes</span></div>${status('Pendente')}</div>
        <div class="setting-row"><div><b>Backup e recuperação</b><span>Devem ser configurados no provedor de banco</span></div>${status('Pendente')}</div>
      </article>
    </section>`;
}

async function render() {
  const meta = pageMeta[state.page] || pageMeta.dashboard;
  pageTitle.textContent = meta.title;
  pageEyebrow.textContent = meta.eyebrow;
  
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.page === state.page);
  });
  
  const renderers = { 
    dashboard: renderDashboard, alunos: renderStudents, turmas: renderClasses, 
    financeiro: renderFinance, presenca: renderAttendance, graduacoes: renderGraduations, 
    relatorios: renderReports, configuracoes: renderSettings 
  };
  
  try { 
    await renderers[state.page](); 
  } catch (error) { 
    view.innerHTML = emptyState('Não foi possível carregar esta tela', error.message || 'Tente novamente em instantes.'); 
    toast('Falha ao carregar', error.message, 'error'); 
  }
}

function setPage(page) {
  if (!pageMeta[page]) return;
  state.page = page;
  if (location.hash.slice(1) !== page) location.hash = page;
  closeSidebarMenu();
  render();
}

function closeSidebarMenu() {
  sidebar.classList.remove('open');
  sidebarBackdrop.hidden = true;
  document.body.classList.remove('sidebar-open');
  document.querySelector('[data-action="toggle-menu"]')?.setAttribute('aria-expanded', 'false');
  document.querySelector('[data-action="toggle-menu"]')?.setAttribute('aria-label', 'Abrir menu');
}

function toggleSidebarMenu() {
  const isOpen = !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', isOpen);
  sidebarBackdrop.hidden = !isOpen;
  document.body.classList.toggle('sidebar-open', isOpen);
  document.querySelector('[data-action="toggle-menu"]')?.setAttribute('aria-expanded', String(isOpen));
  document.querySelector('[data-action="toggle-menu"]')?.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
}

async function studentModal(student = null) {
  const [plans, classes] = await Promise.all([api.getPlans(), api.getClasses()]);
  const title = student ? 'Editar aluno' : 'Cadastrar novo aluno';
  const value = (key, fallback = '') => student?.[key] || fallback;
  
  openModal(`
    <form class="modal" id="student-form">
      <div class="modal-header">
        <div><h2>${title}</h2><p>Preencha os dados do aluno abaixo.</p></div>
        <button type="button" class="close-modal" data-action="close-modal">${icon('close')}</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field full"><label>Nome completo *</label><input required name="name" value="${escapeHTML(value('name'))}" placeholder="Ex.: Ana Beatriz Ferreira" /><small class="field-error" data-error="name"></small></div>
          <div class="field"><label>Telefone *</label><input required name="phone" value="${escapeHTML(value('phone'))}" placeholder="(11) 99999-9999" /><small class="field-error" data-error="phone"></small></div>
          <div class="field"><label>Data de nascimento *</label><input required name="birthDate" type="date" value="${value('birthDate')}" /></div>
          <div class="field">
            <label>Plano *</label>
            <select required name="plan">
              <option value="">Selecionar plano</option>
              ${plans.map((plan) => `<option ${value('plan') === plan.name ? 'selected' : ''}>${escapeHTML(plan.name)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>Turma principal *</label>
            <select required name="className">
              <option value="">Selecionar turma</option>
              ${classes.filter((group) => group.status === 'Ativa').map((group) => `<option ${value('className') === group.name ? 'selected' : ''}>${escapeHTML(group.name)}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Data de matrícula *</label><input required name="enrollmentDate" type="date" value="${value('enrollmentDate','2026-10-27')}" /></div>
          <div class="field"><label>CPF <span class="optional">(se necessário)</span></label><input name="cpf" value="${escapeHTML(value('cpf'))}" placeholder="000.000.000-00" /></div>
          <div class="field full"><label>Contato de emergência *</label><input required name="emergencyContact" value="${escapeHTML(value('emergencyContact'))}" placeholder="Nome e telefone do responsável" /></div>
          <div class="field full"><label>Observações <span class="optional">(opcional)</span></label><textarea name="notes" placeholder="Informações relevantes para a academia">${escapeHTML(value('notes'))}</textarea></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-button" data-action="close-modal">Cancelar</button>
          <button class="primary-button" type="submit">${icon('shield')} ${student ? 'Salvar alterações' : 'Confirmar matrícula'}</button>
        </div>
      </div>
    </form>
  `);
  
  document.querySelector('#student-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const errors = {};
    
    if (payload.name.trim().split(' ').length < 2) errors.name = 'Informe nome e sobrenome.';
    if (payload.phone.replace(/\D/g, '').length < 10) errors.phone = 'Informe um telefone válido.';
    
    document.querySelectorAll('[data-error]').forEach((node) => { node.textContent = errors[node.dataset.error] || ''; });
    document.querySelectorAll('.field input').forEach((input) => input.classList.toggle('error', Boolean(errors[input.name])));
    
    if (Object.keys(errors).length) return;
    
    try { 
      const result = student ? await api.updateStudent(student.id, payload) : await api.createStudent(payload); 
      closeModal(); 
      toast(student ? 'Aluno atualizado' : 'Matrícula confirmada', `${result.name} está disponível nas consultas.`); 
      setPage('alunos'); 
    } catch (error) { 
      document.querySelector('[data-error="name"]').textContent = error.message; 
      toast('Não foi possível salvar', error.message, 'error'); 
    }
  });
}

async function paymentModal(chargeId = '') {
  const charges = await api.getCharges();
  const available = charges.filter((charge) => charge.status !== 'Paga');
  const selected = available.find((charge) => charge.id === chargeId) || available[0];
  
  openModal(`
    <form class="modal" id="payment-form">
      <div class="modal-header">
        <div><h2>Registrar pagamento</h2><p>Vincule o recebimento a uma cobrança.</p></div>
        <button type="button" class="close-modal" data-action="close-modal">${icon('close')}</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field full">
            <label>Cobrança relacionada *</label>
            <select required name="chargeId">
              ${available.map((charge) => `<option value="${charge.id}" ${selected?.id === charge.id ? 'selected' : ''}>${escapeHTML(charge.student)} · ${money(charge.originalAmount || charge.amount)} · venc. ${shortDate(charge.due)}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Valor recebido *</label><input required name="amount" type="number" min="1" step="0.01" value="${selected?.originalAmount || selected?.amount || ''}" /></div>
          <div class="field"><label>Data do pagamento *</label><input required name="date" type="date" value="2026-10-27" /></div>
          <div class="field full">
            <label>Método *</label>
            <select required name="method">
              <option>PIX</option><option>Dinheiro</option><option>Cartão</option><option>Transferência</option><option>Outro</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-button" data-action="close-modal">Cancelar</button>
          <button class="primary-button" type="submit">${icon('wallet')} Confirmar pagamento</button>
        </div>
      </div>
    </form>
  `);
  
  document.querySelector('#payment-form').addEventListener('submit', async (event) => { 
    event.preventDefault(); 
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries()); 
    try { 
      const result = await api.registerPayment(payload); 
      closeModal(); 
      toast('Pagamento registrado', `${result.student}: ${money(result.amount)} confirmado via ${result.method}.`); 
      setPage('financeiro'); 
    } catch (error) { 
      toast('Pagamento não registrado', error.message, 'error'); 
    } 
  });
}

async function graduationModal() {
  const data = await api.getGraduations();
  openModal(`
    <form class="modal" id="graduation-form">
      <div class="modal-header">
        <div><h2>Registrar graduação</h2><p>O novo registro atualiza a graduação atual e preserva as anteriores.</p></div>
        <button type="button" class="close-modal" data-action="close-modal">${icon('close')}</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field full">
            <label>Aluno *</label>
            <select required name="studentId">
              ${data.students.map((student) => `<option value="${student.id}">${escapeHTML(student.name)} · ${escapeHTML(student.belt)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>Faixa *</label>
            <select required name="belt">
              <option>Branca</option><option>Azul</option><option>Roxa</option><option>Marrom</option><option>Preta</option>
            </select>
          </div>
          <div class="field">
            <label>Graus *</label>
            <select required name="degrees">
              <option value="0">0 graus</option><option value="1">1 grau</option><option value="2">2 graus</option><option value="3">3 graus</option><option value="4">4 graus</option>
            </select>
          </div>
          <div class="field full"><label>Data da graduação *</label><input required name="date" type="date" value="2026-10-27" /></div>
          <div class="field full"><label>Observação <span class="optional">(opcional)</span></label><textarea name="note" placeholder="Avaliação, cerimônia ou observação técnica"></textarea></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-button" data-action="close-modal">Cancelar</button>
          <button class="primary-button" type="submit">${icon('belt')} Registrar graduação</button>
        </div>
      </div>
    </form>
  `);
  
  document.querySelector('#graduation-form').addEventListener('submit', async (event) => { 
    event.preventDefault(); 
    try { 
      const record = await api.addGraduation(Object.fromEntries(new FormData(event.currentTarget).entries())); 
      closeModal(); 
      toast('Graduação registrada', `${record.student} agora está na faixa ${record.belt}.`); 
      setPage('graduacoes'); 
    } catch (error) { 
      toast('Não foi possível registrar', error.message, 'error'); 
    } 
  });
}

async function classModal(group = null) {
  const value = (key, fallback = '') => group?.[key] || fallback;
  openModal(`
    <form class="modal" id="class-form">
      <div class="modal-header">
        <div><h2>${group ? 'Editar turma' : 'Nova turma'}</h2><p>Horários, capacidade e responsável.</p></div>
        <button type="button" class="close-modal" data-action="close-modal">${icon('close')}</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field full"><label>Nome da turma *</label><input required name="name" value="${escapeHTML(value('name'))}" placeholder="Ex.: Adulto · Noite" /></div>
          <div class="field"><label>Tipo *</label><input required name="type" value="${escapeHTML(value('type','Jiu-Jítsu Adulto'))}" /></div>
          <div class="field"><label>Professor responsável *</label><input required name="teacher" value="${escapeHTML(value('teacher'))}" placeholder="Ex.: Prof. Caio Martins" /></div>
          <div class="field"><label>Dias *</label><input required name="days" value="${escapeHTML(value('days','Seg · Qua · Sex'))}" /></div>
          <div class="field"><label>Horário *</label><input required name="time" value="${escapeHTML(value('time','19:30 — 21:00'))}" /></div>
          <div class="field"><label>Capacidade *</label><input required name="capacity" min="1" type="number" value="${value('capacity','20')}" /></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-button" data-action="close-modal">Cancelar</button>
          <button class="primary-button" type="submit">${icon('calendar')} ${group ? 'Salvar turma' : 'Criar turma'}</button>
        </div>
      </div>
    </form>
  `);
  
  document.querySelector('#class-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    try { 
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries()); 
      const result = group ? await api.updateClass(group.id, payload) : await api.createClass(payload); 
      closeModal(); 
      toast(group ? 'Turma atualizada' : 'Turma criada', `${result.name} está disponível na agenda.`); 
      setPage('turmas'); 
    } catch (error) { 
      toast('Não foi possível salvar', error.message, 'error'); 
    }
  });
}

async function classMembersModal(id) {
  const [classes, students] = await Promise.all([api.getClasses(), api.getStudents()]);
  const group = classes.find((item) => item.id === id);
  const members = students.filter((student) => group?.students.includes(student.id));
  
  openModal(`
    <div class="modal">
      <div class="modal-header">
        <div><h2>Participantes</h2><p>${escapeHTML(group?.name || 'Turma')} · ${members.length} aluno${members.length === 1 ? '' : 's'} vinculado${members.length === 1 ? '' : 's'}.</p></div>
        <button class="close-modal" data-action="close-modal">${icon('close')}</button>
      </div>
      <div class="modal-body">
        <div class="activity-list">
          ${members.length ? members.map((student) => `
            <div class="activity">
              ${avatar(student)}
              <div><strong>${escapeHTML(student.name)}</strong><small>${escapeHTML(student.belt)} · ${escapeHTML(student.plan)}</small></div>
              ${status(student.status)}
            </div>
          `).join('') : emptyState('Nenhum participante', 'Vincule alunos à turma através da matrícula.')}
        </div>
        <div class="modal-footer"><button class="primary-button" data-action="close-modal">Fechar</button></div>
      </div>
    </div>
  `);
}

function planModal(plan) {
  openModal(`
    <form class="modal" id="plan-form">
      <div class="modal-header">
        <div><h2>Editar plano</h2><p>Novos valores serão aplicados apenas a cobranças futuras.</p></div>
        <button type="button" class="close-modal" data-action="close-modal">${icon('close')}</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field full"><label>Nome *</label><input required name="name" value="${escapeHTML(plan.name)}" /></div>
          <div class="field"><label>Valor *</label><input required name="price" min="1" step="0.01" type="number" value="${plan.price}" /></div>
          <div class="field">
            <label>Periodicidade *</label>
            <select required name="periodicity">
              <option ${plan.periodicity === 'Mensal' ? 'selected' : ''}>Mensal</option>
              <option ${plan.periodicity === 'Trimestral' ? 'selected' : ''}>Trimestral</option>
            </select>
          </div>
          <div class="field"><label>Dia de vencimento *</label><input required name="dueDay" min="1" max="28" type="number" value="${plan.dueDay}" /></div>
          <div class="field full"><label>Condições básicas</label><textarea name="condition">${escapeHTML(plan.condition)}</textarea></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-button" data-action="close-modal">Cancelar</button>
          <button class="primary-button" type="submit">Salvar plano</button>
        </div>
      </div>
    </form>
  `);
  
  document.querySelector('#plan-form').addEventListener('submit', async (event) => { 
    event.preventDefault(); 
    try { 
      const result = await api.updatePlan(plan.id, Object.fromEntries(new FormData(event.currentTarget).entries())); 
      closeModal(); 
      toast('Plano atualizado', `As próximas cobranças de ${result.name} usarão o novo valor.`); 
      setPage('financeiro'); 
    } catch (error) { 
      toast('Não foi possível salvar', error.message, 'error'); 
    } 
  });
}

async function attendanceHistoryModal() {
  const records = await api.getAttendanceHistory(state.attendanceClass);
  openModal(`
    <div class="modal">
      <div class="modal-header">
        <div><h2>Histórico de frequência</h2><p>Registros lançados para a turma selecionada.</p></div>
        <button class="close-modal" data-action="close-modal">${icon('close')}</button>
      </div>
      <div class="modal-body">
        <div class="activity-list">
          ${records.length ? records.map((record) => `
            <div class="activity">
              ${avatar(record.student)}
              <div><strong>${escapeHTML(record.student.name)}</strong><small>${escapeHTML(record.group.name)} · ${shortDate(record.date)}</small></div>
              ${status(record.status)}
            </div>
          `).join('') : emptyState('Sem registros', 'A primeira chamada salva aparecerá aqui.')}
        </div>
        <div class="modal-footer"><button class="primary-button" data-action="close-modal">Fechar</button></div>
      </div>
    </div>
  `);
}

function loginOverlay() {
  const current = document.querySelector('.login-overlay');
  if (current) return;
  
  const overlay = document.createElement('section');
  overlay.className = 'login-overlay';
  overlay.innerHTML = `
    <form class="login-card" id="login-form">
      <div class="login-brand"><img class="brand-logo" src="assets/paiva-team.png" alt="Paiva Team" /></div>
      <h1>Acesso administrativo</h1>
      <p>Entre para acompanhar a operação da sua academia.</p>
      <div class="field"><label>E-mail</label><input name="email" type="email" placeholder="admin@academia.com" autocomplete="email" /></div>
      <div class="field"><label>Senha</label><input name="password" type="password" placeholder="Sua senha" autocomplete="current-password" /></div>
      <div class="login-error" id="login-error"></div>
      <button class="primary-button" type="submit">${icon('lock')} Acessar painel</button>
      <div class="login-disclaimer">${icon('shield')} Acesso restrito a administradores.</div>
    </form>
  `;
  
  document.body.append(overlay);
  
  overlay.querySelector('#login-form').addEventListener('submit', async (event) => { 
    event.preventDefault(); 
    
    const btn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = 'Entrando...';
    btn.disabled = true;

    const { email, password } = Object.fromEntries(new FormData(event.currentTarget).entries()); 
    const errorElement = overlay.querySelector('#login-error'); 
    errorElement.textContent = '';

    try {
      const response = await api.login({ email, password });
      
      // Salva o token no localStorage
      localStorage.setItem('@PaivaTeam:token', response.token);
      
      overlay.remove(); 
      toast('Bem-vindo', `Sessão iniciada como ${response.user.name}.`);
      
      // Recarrega os dados da tela atual
      render();
      
    } catch (error) {
      errorElement.textContent = error.message;
      btn.innerHTML = originalBtnText;
      btn.disabled = false;
    }
  });
}

async function handleAction(target) {
  const actionElement = target.closest('[data-action]');
  if (!actionElement) return;
  
  const { action, id, status: selectedStatus, chargeId } = actionElement.dataset;
  
  if (action === 'close-modal') return closeModal();
  if (action === 'toggle-menu') return toggleSidebarMenu();
  if (action === 'close-menu') return closeSidebarMenu();
  if (action === 'logout') { 
    localStorage.removeItem('@PaivaTeam:token');
    closeSidebarMenu(); 
    return loginOverlay(); 
  }
  if (action === 'open-student') return studentModal();
  if (action === 'open-payment') return paymentModal(chargeId);
  if (action === 'open-graduation') return graduationModal();
  if (action === 'open-class') return classModal();
  if (action === 'student-filter') { state.studentStatus = selectedStatus; return renderStudents(); }
  if (action === 'toggle-student') { 
    const record = await api.toggleStudentStatus(id); 
    toast(record.status === 'Ativo' ? 'Aluno reativado' : 'Aluno inativado', `${record.name} mantém todo o histórico.`); 
    return renderStudents(); 
  }
  if (action === 'edit-student') { const student = await api.getStudent(id); return studentModal(student); }
  if (action === 'edit-class') { const classes = await api.getClasses(); return classModal(classes.find((group) => group.id === id)); }
  if (action === 'close-class') { 
    try { 
      const group = await api.closeClass(id); 
      toast('Turma encerrada', `${group.name} foi encerrada sem apagar o histórico.`); 
      return renderClasses(); 
    } catch (error) { 
      return toast('Não foi possível encerrar', error.message, 'error'); 
    } 
  }
  if (action === 'class-members') return classMembersModal(id);
  if (action === 'edit-plan') { const plans = await api.getPlans(); return planModal(plans.find((plan) => plan.id === id)); }
  if (action === 'select-attendance-class') { state.attendanceClass = id; return renderAttendance(); }
  if (action === 'attendance-choice') { 
    state.attendanceRecords = state.attendanceRecords.map((record) => record.student.id === id ? { ...record, status: selectedStatus } : record); 
    return renderAttendance(); 
  }
  if (action === 'save-attendance') { 
    try { 
      await api.saveAttendance({ 
        classId: state.attendanceClass, 
        date: state.attendanceDate, 
        records: state.attendanceRecords.map((record) => ({ studentId: record.student.id, status: record.status })) 
      }); 
      toast('Chamada salva', 'Presenças registradas com sucesso.'); 
    } catch (error) { 
      toast('Não foi possível salvar', error.message, 'error'); 
    } 
    return; 
  }
  if (action === 'download-report') return toast('Exportação preparada', 'A geração de arquivo será vinculada ao backend em breve.');
  if (action === 'class-calendar') return toast('Agenda de turmas', 'A visualização semanal será conectada à agenda em breve.');
  if (action === 'attendance-history') return attendanceHistoryModal();
  if (action === 'integration-help') return toast('Contrato de integração', 'Consulte o arquivo README.md para os endpoints previstos.');
  if (action === 'notifications') return toast('1 pendência financeira', 'Thiago Mendes possui uma cobrança vencida.');
  if (action === 'open-calendar') return toast('Período de referência', 'Este painel está exibindo os dados de outubro de 2026.');
  if (action === 'future-tab') return toast('Visão em preparação', 'Os detalhes desta consulta serão disponibilizados em breve.');
}

document.addEventListener('click', (event) => {
  const pageElement = event.target.closest('[data-page]');
  if (pageElement) { setPage(pageElement.dataset.page); return; }
  handleAction(event.target);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar.classList.contains('open')) closeSidebarMenu();
});

window.addEventListener('resize', () => { if (window.innerWidth > 820) closeSidebarMenu(); });

document.addEventListener('input', (event) => {
  if (event.target.id !== 'student-search') return;
  state.studentQuery = event.target.value;
  clearTimeout(studentSearchTimer);
  studentSearchTimer = setTimeout(async () => {
    await renderStudents();
    const search = document.querySelector('#student-search');
    if (search) { 
      search.focus(); 
      search.setSelectionRange(state.studentQuery.length, state.studentQuery.length); 
    }
  }, 260);
});

document.addEventListener('change', (event) => { 
  if (event.target.id === 'attendance-date') { 
    state.attendanceDate = event.target.value; 
    renderAttendance(); 
  } 
});

window.addEventListener('hashchange', () => {
  const page = location.hash.slice(1);
  if (page && page !== state.page && pageMeta[page]) { 
    closeSidebarMenu(); 
    state.page = page; 
    render(); 
  }
});

// Escuta o evento de sessão expirada disparado pelo api-client.js
window.addEventListener('auth:expired', () => {
  toast('Sessão expirada', 'Faça login novamente para continuar.', 'error');
  loginOverlay();
});

// Inicialização do App
if (!localStorage.getItem('@PaivaTeam:token') && dataMode === 'api') {
  // Se estiver conectado à API real e não tiver token, força o login
  loginOverlay();
} else {
  // Se estiver no modo demo ou já tiver token, libera o acesso
  render();
  // No modo demo, mostramos a tela de login apenas como demonstração visual
  if (dataMode === 'demo') loginOverlay();
}
