# Vocal Odyssey Backend  
Node.js Project with Express.js and Mongoose

## API Endpoints 

### Authentication Routes  
**POST** `/api/v1/auth/login` - User login  
**POST** `/api/v1/auth/signup` - User registration  
**POST** `/api/v1/auth/google-signin` - Google authentication  
**POST** `/api/v1/auth/request-password-recovery` - Request password recovery  
**POST** `/api/v1/auth/recover-password` - Password recovery

### Supervisor Routes  
**GET** `/api/v1/supervisor/:id` - Get supervisor details  
**PUT** `/api/v1/supervisor/:id` - Update supervisor  
**DELETE** `/api/v1/supervisor/:id` - Delete supervisor  

### Children Routes  
**GET** `/api/v1/children?supervisorId=:id` - Get all children   
**GET** `/api/v1/children/:id` - Get child details  
**POST** `/api/v1/children` - Create a child  
**PUT** `/api/v1/children/:id` - Update child  
**DELETE** `/api/v1/children/:id` - Delete child  

### Levels Routes  
**GET** `/api/v1/levels` - Get all levels  
**GET** `/api/v1/levels/:id` - Get level details  
**POST** `/api/v1/levels` - Create a new level  
**PUT** `/api/v1/levels/:id` - Update level  
**DELETE** `/api/v1/levels/:id` - Delete level  

### Progress Routes  
**GET** `/api/v1/progress?childId=:id` - Get child’s progress  
**GET** `/api/v1/progress/:id` - Get specific progress  
**POST** `/api/v1/progress` - Create a progress entry  

### Attempt Routes  
**GET** `/api/v1/attempts/:id` - Get attempt details  
**GET** `/api/v1/attempts/by-progress?progressId=:id` - Get attempts for progress  
**POST** `/api/v1/attempts/by-progress?progressId=:id` - Record a new attempt  

### Speech Routes  
**POST** `/api/v1/speech/create` - Create speech from text  
**POST** `/api/v1/speech/evaluate` - Evaluate speech with reference text  

### Admin Routes  
**GET** `/api/v1/admin/users` - Get all users  
**DELETE** `/api/v1/admin/users/:id` - Delete user  
