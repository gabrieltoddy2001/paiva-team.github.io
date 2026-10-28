const clone = (value) => JSON.parse(JSON.stringify(value));
const wait = (value, delay = 180) => new Promise((resolve) => setTimeout(() => resolve(clone(value)), delay));

const db = {
  students: [
    { id: 'a01', name: 'Matheus Oliveira', initials: 'MO', color: 'orange', phone: '(11) 98841-2033', birthDate: '1998-08-14', enrollmentDate: '2025-02-03', plan: 'Mensal Ilimitado', className: 'Adulto · Noite', status: 'Ativo', enrollmentStatus: 'Regular', belt: 'Azul · 2 graus', emergencyContact: 'Renata Oliveira', notes: 'Treina 3x por semana.' },
    { id: 'a02', name: 'Sofia Nascimento', initials: 'SN', color: 'violet', phone: '(11) 97602-8841', birthDate: '2012-05-21', enrollmentDate: '2025-03-17', plan: 'Kids 2x semana', className: 'Kids · Tarde', status: 'Ativo', enrollmentStatus: 'Regular', belt: 'Cinza e preta · 3 graus', emergencyContact: 'Lucas Nascimento', notes: 'Responsável presente na primeira aula.' },
    { id: 'a03', name: 'João Pedro Lima', initials: 'JL', color: 'blue', phone: '(11) 99128-3155', birthDate: '1995-01-08', enrollmentDate: '2024-09-12', plan: 'Mensal Ilimitado', className: 'Adulto · Noite', status: 'Ativo', enrollmentStatus: 'Regular', belt: 'Branca · 4 graus', emergencyContact: 'Camila Lima', notes: '' },
    { id: 'a04', name: 'Isabela Rocha', initials: 'IR', color: 'pink', phone: '(11) 98405-7138', birthDate: '2000-11-29', enrollmentDate: '2026-10-04', plan: 'Mensal 3x semana', className: 'Fundamentos · Manhã', status: 'Ativo', enrollmentStatus: 'Regular', belt: 'Branca · 1 grau', emergencyContact: 'Mariana Rocha', notes: 'Alergia a dipirona.' },
    { id: 'a05', name: 'Thiago Mendes', initials: 'TM', color: 'green', phone: '(11) 98533-1059', birthDate: '1989-04-11', enrollmentDate: '2025-08-04', plan: 'Mensal 3x semana', className: 'Fundamentos · Manhã', status: 'Ativo', enrollmentStatus: 'Regular', belt: 'Azul · 1 grau', emergencyContact: 'Mônica Mendes', notes: '' },
    { id: 'a06', name: 'Marina Costa', initials: 'MC', color: 'yellow', phone: '(11) 97216-4218', birthDate: '1991-07-17', enrollmentDate: '2024-04-02', plan: 'Mensal Ilimitado', className: 'Adulto · Noite', status: 'Ativo', enrollmentStatus: 'Regular', belt: 'Roxa · 2 graus', emergencyContact: 'Rafael Costa', notes: '' },
    { id: 'a07', name: 'Bruno Azevedo', initials: 'BA', color: 'red', phone: '(11) 99873-0390', birthDate: '1986-03-22', enrollmentDate: '2023-10-08', plan: 'Mensal Ilimitado', className: 'Adulto · Noite', status: 'Inativo', enrollmentStatus: 'Trancada', belt: 'Azul · 3 graus', emergencyContact: 'Aline Azevedo', notes: 'Trancamento solicitado em setembro.' },
    { id: 'a08', name: 'Luiza Ferraz', initials: 'LF', color: 'teal', phone: '(11) 99621-0671', birthDate: '2014-02-09', enrollmentDate: '2026-10-11', plan: 'Kids 2x semana', className: 'Kids · Tarde', status: 'Ativo', enrollmentStatus: 'Regular', belt: 'Branca · 2 graus', emergencyContact: 'Felipe Ferraz', notes: '' }
  ],
  classes: [
    { id: 't01', name: 'Adulto · Noite', type: 'Jiu-Jítsu Adulto', days: 'Seg · Qua · Sex', time: '19:30 — 21:00', teacher: 'Prof. Caio Martins', capacity: 28, enrolled: 24, status: 'Ativa', color: 'lime', students: ['a01', 'a03', 'a06'] },
    { id: 't02', name: 'Fundamentos · Manhã', type: 'Fundamentos', days: 'Ter · Qui', time: '07:00 — 08:00', teacher: 'Prof. André Silva', capacity: 18, enrolled: 12, status: 'Ativa', color: 'blue', students: ['a04', 'a05'] },
    { id: 't03', name: 'Kids · Tarde', type: 'Jiu-Jítsu Kids', days: 'Ter · Qui', time: '17:30 — 18:30', teacher: 'Profª Bianca Reis', capacity: 16, enrolled: 14, status: 'Ativa', color: 'orange', students: ['a02', 'a08'] },
    { id: 't04', name: 'Open Mat · Sábado', type: 'Treino livre', days: 'Sábado', time: '10:00 — 11:30', teacher: 'Equipe técnica', capacity: 32, enrolled: 19, status: 'Ativa', color: 'violet', students: ['a01', 'a03', 'a05'] }
  ],
  plans: [
    { id: 'p01', name: 'Mensal Ilimitado', price: 189, periodicity: 'Mensal', dueDay: 10, members: 47, condition: 'Acesso a todas as turmas adultas' },
    { id: 'p02', name: 'Mensal 3x semana', price: 159, periodicity: 'Mensal', dueDay: 10, members: 29, condition: 'Até 3 aulas semanais' },
    { id: 'p03', name: 'Kids 2x semana', price: 149, periodicity: 'Mensal', dueDay: 5, members: 21, condition: 'Turmas infantis selecionadas' }
  ],
  charges: [
    { id: 'c01', studentId: 'a01', student: 'Matheus Oliveira', plan: 'Mensal Ilimitado', due: '2026-10-10', amount: 189, status: 'Paga', paidAt: '2026-10-08', method: 'PIX' },
    { id: 'c02', studentId: 'a02', student: 'Sofia Nascimento', plan: 'Kids 2x semana', due: '2026-10-05', amount: 149, status: 'Paga', paidAt: '2026-10-04', method: 'Cartão' },
    { id: 'c03', studentId: 'a03', student: 'João Pedro Lima', plan: 'Mensal Ilimitado', due: '2026-10-10', amount: 189, status: 'Pendente', paidAt: null, method: null },
    { id: 'c04', studentId: 'a04', student: 'Isabela Rocha', plan: 'Mensal 3x semana', due: '2026-10-12', amount: 159, status: 'Pendente', paidAt: null, method: null },
    { id: 'c05', studentId: 'a05', student: 'Thiago Mendes', plan: 'Mensal 3x semana', due: '2026-10-10', amount: 159, status: 'Vencida', paidAt: null, method: null },
    { id: 'c06', studentId: 'a06', student: 'Marina Costa', plan: 'Mensal Ilimitado', due: '2026-10-10', amount: 189, status: 'Paga', paidAt: '2026-10-10', method: 'Dinheiro' },
    { id: 'c07', studentId: 'a08', student: 'Luiza Ferraz', plan: 'Kids 2x semana', due: '2026-11-05', amount: 149, status: 'Pendente', paidAt: null, method: null }
  ],
  attendance: [
    { id: 'pr01', classId: 't01', date: '2026-10-27', studentId: 'a01', status: 'Presente' },
    { id: 'pr02', classId: 't01', date: '2026-10-27', studentId: 'a03', status: 'Presente' },
    { id: 'pr03', classId: 't01', date: '2026-10-27', studentId: 'a06', status: 'Ausente' }
  ],
  graduations: [
    { id: 'g01', studentId: 'a01', student: 'Matheus Oliveira', belt: 'Azul', degrees: 2, date: '2026-08-20', note: 'Avaliação técnica aprovada.' },
    { id: 'g02', studentId: 'a05', student: 'Thiago Mendes', belt: 'Azul', degrees: 1, date: '2026-07-12', note: 'Evolução consistente.' },
    { id: 'g03', studentId: 'a06', student: 'Marina Costa', belt: 'Roxa', degrees: 2, date: '2026-05-25', note: 'Participação em campeonato regional.' }
  ],
  activities: [
    { text: 'Pagamento confirmado', detail: 'Matheus Oliveira · PIX', time: 'há 18 min', type: 'payment' },
    { text: 'Nova matrícula', detail: 'Luiza Ferraz · Kids 2x semana', time: 'há 1h', type: 'student' },
    { text: 'Graduação registrada', detail: 'Matheus Oliveira · Azul 2º grau', time: 'ontem', type: 'belt' }
  ]
};

db.charges.forEach((charge) => {
  charge.originalAmount = charge.amount;
  charge.paidAmount = charge.status === 'Paga' ? charge.amount : 0;
});

function initials(name) {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function findDuplicate(payload, ignoredId = '') {
  const normalizedName = payload.name?.trim().toLowerCase();
  const normalizedPhone = payload.phone?.replace(/\D/g, '');
  const normalizedCpf = payload.cpf?.replace(/\D/g, '');
  return db.students.find((student) => student.id !== ignoredId && (
    (normalizedName && student.name.trim().toLowerCase() === normalizedName) ||
    (normalizedPhone && student.phone.replace(/\D/g, '') === normalizedPhone) ||
    (normalizedCpf && student.cpf?.replace(/\D/g, '') === normalizedCpf)
  ));
}

function monthlyReceived() {
  return db.charges.filter((charge) => charge.status === 'Paga' && charge.paidAt?.startsWith('2026-10')).reduce((total, charge) => total + charge.paidAmount, 0);
}

export const mockService = {
  async login({ email, password }) {
    // Simula a validação do backend
    if (email && password.length >= 6) {
      return wait({ 
        token: 'mock-jwt-token-12345', 
        user: { name: 'Caio Martins', role: 'Administrador' } 
      }, 500);
    }
    const error = new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    error.code = 'UNAUTHORIZED';
    throw error;
  },

  async getDashboard() {
    const active = db.students.filter((student) => student.status === 'Ativo').length;
    const inactive = db.students.filter((student) => student.status === 'Inativo').length;
    const paid = db.charges.filter((charge) => charge.status === 'Paga').length;
    const pending = db.charges.filter((charge) => charge.status === 'Pendente').length;
    const overdue = db.charges.filter((charge) => charge.status === 'Vencida').length;
    const monthCharges = db.charges.filter((charge) => charge.due.startsWith('2026-10'));
    const collectionTarget = monthCharges.reduce((total, charge) => total + charge.originalAmount, 0);
    const received = monthlyReceived();
    return wait({ 
      active, inactive, paid, pending, overdue, received, 
      collectionTarget, 
      outstanding: Math.max(collectionTarget - received, 0), 
      recentStudents: [...db.students].sort((a, b) => b.enrollmentDate.localeCompare(a.enrollmentDate)).slice(0, 4), 
      upcoming: db.charges.filter((charge) => charge.status !== 'Paga').slice(0, 4), 
      activities: db.activities 
    });
  },

  async getStudents({ query = '', status = 'Todos' } = {}) {
    const normalized = query.toLowerCase().trim();
    const result = db.students.filter((student) => {
      const findable = `${student.name} ${student.phone} ${student.plan}`.toLowerCase();
      return (!normalized || findable.includes(normalized)) && (status === 'Todos' || student.status === status);
    });
    return wait(result);
  },

  async getStudent(id) {
    return wait(db.students.find((student) => student.id === id));
  },

  async createStudent(payload) {
    const duplicate = findDuplicate(payload);
    if (duplicate) {
      const error = new Error(`Possível duplicidade com ${duplicate.name}. Revise nome ou telefone antes de cadastrar.`);
      error.code = 'DUPLICATE';
      throw error;
    }
    const student = { 
      id: `a${String(db.students.length + 1).padStart(2, '0')}`, 
      initials: initials(payload.name), 
      color: 'lime', status: 'Ativo', enrollmentStatus: 'Regular', belt: 'Branca · 0 graus', 
      emergencyContact: payload.emergencyContact, notes: payload.notes || '', 
      ...payload 
    };
    db.students.unshift(student);
    db.activities.unshift({ text: 'Nova matrícula', detail: `${student.name} · ${student.plan}`, time: 'agora', type: 'student' });
    return wait(student, 260);
  },

  async updateStudent(id, payload) {
    const index = db.students.findIndex((student) => student.id === id);
    if (index < 0) throw new Error('Aluno não encontrado.');
    
    const duplicate = findDuplicate(payload, id);
    if (duplicate) {
      const error = new Error(`Possível duplicidade com ${duplicate.name}. Revise nome, telefone ou CPF antes de salvar.`);
      error.code = 'DUPLICATE';
      throw error;
    }
    
    db.students[index] = { ...db.students[index], ...payload };
    return wait(db.students[index]);
  },

  async toggleStudentStatus(id) {
    const student = db.students.find((item) => item.id === id);
    if (!student) throw new Error('Aluno não encontrado.');
    student.status = student.status === 'Ativo' ? 'Inativo' : 'Ativo';
    return wait(student);
  },

  async getClasses() { return wait(db.classes); },
  
  async createClass(payload) {
    const group = { 
      id: `t${String(db.classes.length + 1).padStart(2, '0')}`, 
      name: payload.name, type: payload.type, days: payload.days, time: payload.time, 
      teacher: payload.teacher, capacity: Number(payload.capacity), enrolled: 0, 
      status: 'Ativa', color: 'lime', students: [] 
    };
    db.classes.push(group);
    return wait(group, 240);
  },
  
  async updateClass(id, payload) {
    const group = db.classes.find((item) => item.id === id);
    if (!group) throw new Error('Turma não encontrada.');
    Object.assign(group, { ...payload, capacity: Number(payload.capacity) });
    return wait(group, 240);
  },
  
  async closeClass(id) {
    const group = db.classes.find((item) => item.id === id);
    if (!group) throw new Error('Turma não encontrada.');
    group.status = 'Encerrada';
    return wait(group, 220);
  },
  
  async getPlans() { return wait(db.plans); },
  
  async updatePlan(id, payload) {
    const plan = db.plans.find((item) => item.id === id);
    if (!plan) throw new Error('Plano não encontrado.');
    Object.assign(plan, { ...payload, price: Number(payload.price), dueDay: Number(payload.dueDay) });
    return wait(plan, 220);
  },
  
  async getCharges() { return wait(db.charges); },

  async getFinancialOverview() {
    const charges = clone(db.charges);
    return wait({ 
      charges, plans: db.plans, received: monthlyReceived(), 
      overdueTotal: charges.filter((item) => item.status === 'Vencida').reduce((total, item) => total + item.originalAmount, 0), 
      pendingTotal: charges.filter((item) => item.status === 'Pendente').reduce((total, item) => total + item.originalAmount, 0) 
    });
  },

  async registerPayment(payload) {
    const charge = db.charges.find((item) => item.id === payload.chargeId);
    if (!charge) throw new Error('Cobrança não encontrada para o pagamento.');
    if (charge.status === 'Paga') throw new Error('Esta cobrança já possui um pagamento registrado.');
    
    const amount = Number(payload.amount);
    if (amount !== charge.originalAmount) {
      throw new Error(`Pagamento parcial não está configurado nesta demonstração. Registre o valor integral de ${charge.originalAmount.toFixed(2)}.`);
    }
    
    charge.status = 'Paga';
    charge.paidAt = payload.date;
    charge.method = payload.method;
    charge.paidAmount = amount;
    
    db.activities.unshift({ text: 'Pagamento confirmado', detail: `${charge.student} · ${payload.method}`, time: 'agora', type: 'payment' });
    return wait(charge, 240);
  },

  async getAttendance(classId = 't01', date = '2026-10-27') {
    const group = db.classes.find((item) => item.id === classId) || db.classes[0];
    const members = db.students.filter((student) => group.students.includes(student.id));
    const records = members.map((student) => ({ 
      student, 
      status: db.attendance.find((record) => record.classId === classId && record.date === date && record.studentId === student.id)?.status || 'Ausente' 
    }));
    return wait({ group, date, records });
  },

  async saveAttendance({ classId, date, records }) {
    db.attendance = db.attendance.filter((record) => !(record.classId === classId && record.date === date));
    records.forEach((record) => db.attendance.push({ 
      id: `pr${Date.now()}${record.studentId}`, classId, date, studentId: record.studentId, status: record.status 
    }));
    return wait({ saved: records.length }, 260);
  },

  async getAttendanceHistory(classId = '') {
    const records = db.attendance
      .filter((record) => !classId || record.classId === classId)
      .map((record) => ({ 
        ...record, 
        student: db.students.find((student) => student.id === record.studentId), 
        group: db.classes.find((group) => group.id === record.classId) 
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
    return wait(records);
  },

  async getGraduations() {
    const initialTimeline = [
      { belt: 'Branca', degrees: 0, date: '2024-02-03', note: 'Início da jornada no jiu-jítsu.', studentId: 'a01' },
      { belt: 'Branca', degrees: 4, date: '2025-08-15', note: 'Exame de faixa semestral.', studentId: 'a01' },
    ];
    const latest = [...db.graduations].sort((a, b) => b.date.localeCompare(a.date));
    const featured = latest[0];
    const timeline = [...initialTimeline.filter((item) => item.studentId === featured?.studentId), ...db.graduations.filter((item) => item.studentId === featured?.studentId)].sort((a, b) => a.date.localeCompare(b.date));
    return wait({ latest, featured, timeline, students: db.students.filter((student) => student.status === 'Ativo') });
  },

  async addGraduation(payload) {
    const student = db.students.find((item) => item.id === payload.studentId);
    if (!student) throw new Error('Aluno não encontrado.');
    const graduation = { 
      id: `g${Date.now()}`, studentId: student.id, student: student.name, 
      belt: payload.belt, degrees: Number(payload.degrees), date: payload.date, 
      note: payload.note || 'Registro manual de graduação.' 
    };
    student.belt = `${graduation.belt} · ${graduation.degrees} graus`;
    db.graduations.unshift(graduation);
    db.activities.unshift({ text: 'Graduação registrada', detail: `${student.name} · ${graduation.belt} ${graduation.degrees}º grau`, time: 'agora', type: 'belt' });
    return wait(graduation, 220);
  }
};
