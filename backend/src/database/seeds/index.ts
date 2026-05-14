import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Country } from '../../modules/geography/entities/country.entity';
import { Brand } from '../../modules/equipment-catalog/entities/brand.entity';
import { EquipmentModel } from '../../modules/equipment-catalog/entities/equipment-model.entity';
import { User } from '../../modules/users/entities/user.entity';
import { ClientCompany } from '../../modules/companies/entities/client-company.entity';
import { EndUserCompany } from '../../modules/companies/entities/end-user-company.entity';
import { Technician } from '../../modules/technicians/entities/technician.entity';
import { ChecklistTemplate } from '../../modules/checklists/entities/checklist-template.entity';
import { ChecklistItem } from '../../modules/checklists/entities/checklist-item.entity';
import { UserRole, ServiceType, ChecklistScope, ChecklistInputType } from '../../common/enums';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://pudu:pudu_secret@localhost:5432/pudu_db',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('Connected to database. Starting seed...');

  const countryRepo = dataSource.getRepository(Country);
  const brandRepo = dataSource.getRepository(Brand);
  const modelRepo = dataSource.getRepository(EquipmentModel);
  const userRepo = dataSource.getRepository(User);
  const clientRepo = dataSource.getRepository(ClientCompany);
  const endUserRepo = dataSource.getRepository(EndUserCompany);
  const techRepo = dataSource.getRepository(Technician);
  const templateRepo = dataSource.getRepository(ChecklistTemplate);
  const itemRepo = dataSource.getRepository(ChecklistItem);

  // Countries
  console.log('Seeding countries...');
  const countries = await countryRepo.save([
    { code: 'CL', name: 'Chile', timezone: 'America/Santiago' },
    { code: 'PE', name: 'Perú', timezone: 'America/Lima' },
    { code: 'CO', name: 'Colombia', timezone: 'America/Bogota' },
    { code: 'MX', name: 'México', timezone: 'America/Mexico_City' },
    { code: 'AR', name: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
  ]);
  const [cl, pe, co, mx] = countries;

  // Brand PUDU
  console.log('Seeding brands and models...');
  const pudu = await brandRepo.save({ name: 'PUDU Robotics', slug: 'pudu-robotics' });

  const models = await modelRepo.save([
    {
      name: 'KettyBot',
      slug: 'kettybot',
      brandId: pudu.id,
      category: 'delivery_robot',
      description: 'Robot de entrega y servicio para restaurantes y hoteles',
      preventiveIntervalDays: 365,
      alertDaysBefore: [30, 60, 90],
    },
    {
      name: 'BellaBot',
      slug: 'bellabot',
      brandId: pudu.id,
      category: 'delivery_robot',
      description: 'Robot de servicio con pantalla interactiva y expresiones faciales',
      preventiveIntervalDays: 365,
      alertDaysBefore: [30, 60, 90],
    },
    {
      name: 'FlashBot',
      slug: 'flashbot',
      brandId: pudu.id,
      category: 'delivery_robot',
      description: 'Robot de entrega de alta velocidad para hospitales y hoteles',
      preventiveIntervalDays: 180,
      alertDaysBefore: [30, 45, 60],
    },
    {
      name: 'PuduBot 2',
      slug: 'pudubot-2',
      brandId: pudu.id,
      category: 'delivery_robot',
      description: 'Robot de servicio de múltiples bandejas',
      preventiveIntervalDays: 365,
      alertDaysBefore: [30, 60, 90],
    },
    {
      name: 'CC1',
      slug: 'cc1',
      brandId: pudu.id,
      category: 'cleaning_robot',
      description: 'Robot de limpieza comercial autónomo',
      preventiveIntervalDays: 180,
      alertDaysBefore: [30, 45, 60],
    },
  ]);
  const [kettyBot, bellaBot] = models;

  // Users
  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('Admin1234!', 12);

  const brandAdmin = await userRepo.save({
    email: 'admin@puduservice.com',
    passwordHash,
    fullName: 'Administrador Principal',
    role: UserRole.BRAND_ADMIN,
    countryId: cl.id,
    isActive: true,
  });

  // Client Companies
  console.log('Seeding client companies...');
  const clientCL = await clientRepo.save({
    name: 'Robotec Chile S.A.',
    countryId: cl.id,
    contactEmail: 'contacto@robotec.cl',
    contactPhone: '+56912345678',
    taxId: '12.345.678-9',
  });

  const clientPE = await clientRepo.save({
    name: 'TechRobots Perú S.A.C.',
    countryId: pe.id,
    contactEmail: 'info@techrobots.pe',
    contactPhone: '+51987654321',
  });

  // End User Companies
  console.log('Seeding end user companies...');
  const restaurant1 = await endUserRepo.save({
    name: 'Hotel Grand Hyatt Santiago',
    clientCompanyId: clientCL.id,
    countryId: cl.id,
    contactEmail: 'tech@hyatt-stgo.cl',
    address: 'Av. Kennedy 4601, Las Condes, Santiago',
  });

  const restaurant2 = await endUserRepo.save({
    name: 'Clinica Las Condes',
    clientCompanyId: clientCL.id,
    countryId: cl.id,
    contactEmail: 'sistemas@clinicalascondes.cl',
    address: 'Lo Fontecilla 441, Las Condes, Santiago',
  });

  // Client Admin user
  const clientAdmin = await userRepo.save({
    email: 'admin@robotec.cl',
    passwordHash,
    fullName: 'Carlos Méndez',
    role: UserRole.CLIENT_ADMIN,
    countryId: cl.id,
    clientCompanyId: clientCL.id,
    isActive: true,
  });

  // End user admin
  const endUserAdmin = await userRepo.save({
    email: 'admin@hyatt-stgo.cl',
    passwordHash,
    fullName: 'Ana Torres',
    role: UserRole.END_USER_ADMIN,
    countryId: cl.id,
    clientCompanyId: clientCL.id,
    endUserCompanyId: restaurant1.id,
    isActive: true,
  });

  // Technician user
  const techUser = await userRepo.save({
    email: 'tech1@puduservice.com',
    passwordHash,
    fullName: 'Pedro González',
    phone: '+56911111111',
    role: UserRole.BRAND_TECHNICIAN,
    countryId: cl.id,
    isActive: true,
  });

  await techRepo.save({
    userId: techUser.id,
    countryId: cl.id,
    specializations: [kettyBot.slug, bellaBot.slug],
    isAvailable: true,
  });

  // Checklists
  console.log('Seeding checklist templates...');

  // Common preventive maintenance checklist
  const commonTemplate = await templateRepo.save({
    name: 'Mantenimiento Preventivo - Ítems Comunes',
    serviceType: ServiceType.PREVENTIVE_MAINTENANCE,
    scope: ChecklistScope.COMMON,
    isActive: true,
  });

  const commonItems = [
    { description: 'Verificar estado general del chasis (sin daños visibles)', inputType: ChecklistInputType.BOOLEAN, orderIndex: 1, isRequired: true, critical: false },
    { description: 'Limpiar sensores LiDAR con paño antiestático', inputType: ChecklistInputType.BOOLEAN, orderIndex: 2, isRequired: true, critical: true },
    { description: 'Verificar funcionamiento de sensores de obstáculos', inputType: ChecklistInputType.BOOLEAN, orderIndex: 3, isRequired: true, critical: true },
    { description: 'Inspeccionar estado de ruedas (desgaste, obstrucciones)', inputType: ChecklistInputType.BOOLEAN, orderIndex: 4, isRequired: true, critical: false },
    { description: 'Verificar nivel de batería y ciclos de carga', inputType: ChecklistInputType.NUMBER, orderIndex: 5, isRequired: true, critical: false },
    { description: 'Limpiar ventiladores y rejillas de ventilación', inputType: ChecklistInputType.BOOLEAN, orderIndex: 6, isRequired: true, critical: false },
    { description: 'Actualizar firmware si hay versión disponible', inputType: ChecklistInputType.BOOLEAN, orderIndex: 7, isRequired: false, critical: false },
    { description: 'Verificar conexión WiFi y estabilidad de red', inputType: ChecklistInputType.BOOLEAN, orderIndex: 8, isRequired: true, critical: false },
    { description: 'Revisar logs de errores del sistema', inputType: ChecklistInputType.TEXT, orderIndex: 9, isRequired: true, critical: false },
    { description: 'Verificar estado de la pantalla táctil (sin rayaduras, respuesta correcta)', inputType: ChecklistInputType.BOOLEAN, orderIndex: 10, isRequired: true, critical: false },
    { description: 'Fotografiar estado del robot antes del servicio', inputType: ChecklistInputType.PHOTO, orderIndex: 11, isRequired: true, critical: false },
    { description: 'Fotografiar estado del robot después del servicio', inputType: ChecklistInputType.PHOTO, orderIndex: 12, isRequired: true, critical: false },
  ];

  for (const item of commonItems) {
    await itemRepo.save({ ...item, templateId: commonTemplate.id });
  }

  // KettyBot specific checklist
  const kettyTemplate = await templateRepo.save({
    name: 'Mantenimiento Preventivo - KettyBot (Específico)',
    serviceType: ServiceType.PREVENTIVE_MAINTENANCE,
    scope: ChecklistScope.MODEL_SPECIFIC,
    modelId: kettyBot.id,
    isActive: true,
  });

  const kettyItems = [
    { description: 'Verificar estado y fijación de bandejas de transporte', inputType: ChecklistInputType.BOOLEAN, orderIndex: 1, isRequired: true, critical: false },
    { description: 'Inspeccionar mecanismo de apertura de bandejas', inputType: ChecklistInputType.BOOLEAN, orderIndex: 2, isRequired: true, critical: true },
    { description: 'Calibrar sensores de peso en bandejas (si aplica)', inputType: ChecklistInputType.BOOLEAN, orderIndex: 3, isRequired: false, critical: false },
    { description: 'Verificar sistema de iluminación LED de bandejas', inputType: ChecklistInputType.BOOLEAN, orderIndex: 4, isRequired: true, critical: false },
    { description: 'Verificar altavoz y sistema de audio', inputType: ChecklistInputType.BOOLEAN, orderIndex: 5, isRequired: true, critical: false },
    { description: 'Número de ciclos totales de entrega registrados', inputType: ChecklistInputType.NUMBER, orderIndex: 6, isRequired: true, critical: false },
  ];

  for (const item of kettyItems) {
    await itemRepo.save({ ...item, templateId: kettyTemplate.id });
  }

  // Installation checklist
  const installTemplate = await templateRepo.save({
    name: 'Instalación de Robot - Ítems Comunes',
    serviceType: ServiceType.INSTALLATION,
    scope: ChecklistScope.COMMON,
    isActive: true,
  });

  const installItems = [
    { description: 'Inspección previa del espacio operativo (dimensiones, obstáculos fijos)', inputType: ChecklistInputType.TEXT, orderIndex: 1, isRequired: true, critical: false },
    { description: 'Verificar conectividad WiFi en toda el área de operación', inputType: ChecklistInputType.BOOLEAN, orderIndex: 2, isRequired: true, critical: true },
    { description: 'Definir y registrar la estación de carga', inputType: ChecklistInputType.BOOLEAN, orderIndex: 3, isRequired: true, critical: true },
    { description: 'Realizar mapeado inicial del entorno', inputType: ChecklistInputType.BOOLEAN, orderIndex: 4, isRequired: true, critical: true },
    { description: 'Configurar nombre del robot en la red', inputType: ChecklistInputType.TEXT, orderIndex: 5, isRequired: true, critical: false },
    { description: 'Configurar idioma y voz del robot', inputType: ChecklistInputType.SELECT, options: ['Español', 'Inglés', 'Portugués', 'Chino'], orderIndex: 6, isRequired: true, critical: false },
    { description: 'Realizar prueba de entrega end-to-end', inputType: ChecklistInputType.BOOLEAN, orderIndex: 7, isRequired: true, critical: true },
    { description: 'Documentar credenciales de acceso al sistema', inputType: ChecklistInputType.TEXT, orderIndex: 8, isRequired: true, critical: false },
    { description: 'Firma de conformidad del cliente', inputType: ChecklistInputType.BOOLEAN, orderIndex: 9, isRequired: true, critical: true },
  ];

  for (const item of installItems) {
    await itemRepo.save({ ...item, templateId: installTemplate.id });
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('  Brand Admin: admin@puduservice.com / Admin1234!');
  console.log('  Client Admin: admin@robotec.cl / Admin1234!');
  console.log('  End User Admin: admin@hyatt-stgo.cl / Admin1234!');
  console.log('  Technician: tech1@puduservice.com / Admin1234!');

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
