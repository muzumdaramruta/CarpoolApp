# CarPooling Application

A full-stack carpooling application built with Spring Boot backend and React frontend, featuring real-time messaging with Apache Kafka, user authentication, profile management with image uploads, and ride booking functionality.

## 🏗️ Architecture

### Backend
- **Framework**: Spring Boot 3.x
- **Database**: MySQL
- **ORM**: Hibernate 5
- **Message Queue**: Apache Kafka
- **Session Management**: HTTP Sessions with cookies
- **File Storage**: Local file system

### Frontend
- **Framework**: React 18
- **Styling**: React Bootstrap
- **HTTP Client**: Axios
- **State Management**: React Context API

### Infrastructure
- **Containerization**: Docker (Kafka + Zookeeper)
- **Build Tool**: Maven

## 📁 Project Structure

```
CarPoolingApp/
├── CarPooling-backend/
│   ├── src/main/java/com/example/carpool/
│   │   ├── config/
│   │   │   ├── CorsConfig.java
│   │   │   ├── HibernateConfig.java
│   │   │   ├── KafkaConfig.java
│   │   │   └── WebMvcConfig.java
│   │   ├── controllers/
│   │   │   ├── AuthController.java
│   │   │   └── UserController.java
│   │   ├── dao/
│   │   │   └── UserDao.java
│   │   ├── kafka/
│   │   │   └── KafkaConsumer.java
│   │   ├── model/
│   │   │   └── User.java
│   │   ├── services/
│   │   │   ├── UserService.java
│   │   │   └── UserServiceImpl.java
│   │   ├── validator/
│   │   │   ├── LoginValidator.java
│   │   │   └── UserValidator.java
│   │   ├── exception/
│   │   │   ├── DuplicateResourceException.java
│   │   │   └── ValidationException.java
│   │   └── CarPoolingBackendApplication.java
│   └── uploads/profile-images/
├── carpool-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── common/
│   │   │   │   └── Header.js
│   │   │   └── profile/
│   │   │       └── ProfilePage.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   └── services/
│   │       └── authService.js
└── docker-compose.yml
```

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 16+
- Maven 3.6+
- Docker & Docker Compose
- MySQL 8.0+

### Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE carpool_db;
```

2. Configure database connection in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/carpool_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd CarPooling-backend
```

2. Install dependencies and build:
```bash
./mvnw clean install
```

3. Start Kafka services:
```bash
docker-compose up -d
```

4. Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```

Backend will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd carpool-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React application:
```bash
npm start
```

Frontend will be available at `http://localhost:3000`

## ⚙️ Configuration Files

### Backend Configuration (`application.properties`)

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/carpool_db
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.current_session_context_class=org.springframework.orm.hibernate5.SpringSessionContext

# Kafka Configuration
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=carpool-group
spring.kafka.consumer.auto-offset-reset=latest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.enable-auto-commit=false
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer

# Session Management
server.servlet.session.timeout=30m
server.servlet.session.cookie.name=CARPOOL-SESSION
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=false
server.servlet.session.persistent=false
spring.session.store-type=none

# File Upload Configuration
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
spring.web.resources.static-locations=file:uploads/,classpath:/static/

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allow-credentials=true
```

### Docker Compose (`docker-compose.yml`)

```yaml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    container_name: carpool-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    container_name: carpool-kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: true
    volumes:
      - kafka-data:/var/lib/kafka/data

volumes:
  kafka-data:
```

## 🔧 Features

### Authentication & Authorization
- User registration and login
- Session-based authentication with secure cookies
- Role-based access control (DRIVER/RIDER)
- Password validation and security
- Logout functionality with session cleanup

### User Profile Management
- Profile information editing (name, email, phone)
- Profile image upload with validation
- Image preview and removal
- Secure password change functionality
- Account overview with activity statistics

### Real-time Messaging (Kafka)
- **Topics**:
  - `ride-status-changes`: Track ride state updates
  - `booking-events`: Handle booking-related events
  - `rider-notifications`: Send notifications to riders
- Event-driven architecture for scalability
- Consumer groups for load balancing

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout  
- `POST /api/auth/register` - User registration
- `GET /api/auth/status` - Check authentication status

#### User Management
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/{id}/profile` - Get user profile
- `PUT /api/users/{id}` - Update user information
- `PUT /api/users/{id}/password` - Change password
- `POST /api/users/{id}/profile-image` - Upload profile image
- `DELETE /api/users/{id}/profile-image` - Remove profile image

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role ENUM('DRIVER', 'RIDER') DEFAULT 'RIDER',
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🧪 Testing the Application

### Testing Kafka Message Flow

1. **Check Kafka topics**:
```bash
docker exec carpool-kafka kafka-topics --bootstrap-server localhost:9092 --list
```

2. **Send test messages**:
```bash
# Terminal 1: Start consumer
docker exec carpool-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic ride-status-changes --from-beginning

# Terminal 2: Send test message
docker exec carpool-kafka kafka-console-producer --bootstrap-server localhost:9092 --topic ride-status-changes
# Type: {"rideId": "123", "status": "STARTED"}
```

3. **Check consumer group status**:
```bash
docker exec carpool-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group carpool-group
```

### Testing API Endpoints

Use tools like Postman or curl to test the API:

```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","fullName":"Test User","email":"test@example.com","phoneNumber":"1234567890","role":"RIDER"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"testuser","password":"test123"}'

# Get profile (using session cookie)
curl -X GET http://localhost:8080/api/users/1/profile \
  -b cookies.txt
```

## 📱 Frontend Features

### Components
- **Authentication**: Login and registration forms
- **Header**: Navigation with user status and logout
- **Profile Management**: Card-based layout with image upload
- **Form Validation**: Real-time validation with error handling

### State Management
- React Context for global authentication state
- Session-based authentication with server validation
- Automatic session cleanup on logout

## 🔒 Security Features

- **Input Validation**: Both client and server-side validation
- **SQL Injection Protection**: Using parameterized queries with Hibernate
- **XSS Protection**: Input sanitization and validation
- **CORS Configuration**: Restricted to frontend origin
- **Session Security**: HTTP-only cookies, secure session management
- **File Upload Security**: Type and size validation for images
- **Password Security**: Validation rules and secure storage

## 📊 Monitoring & Debugging

### Logs to Monitor
- **Application startup**: Session cleanup confirmation
- **Kafka consumer status**: Topic assignments and message processing
- **Authentication events**: Login/logout activities
- **File uploads**: Success/failure status
- **Database operations**: SQL queries (if show-sql enabled)

### Debug Endpoints
- `GET /api/users/debug/session` - View current session data
- Check browser console for frontend debugging
- Monitor Kafka consumer lag for message processing

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Use environment variables for sensitive configuration
- [ ] Enable HTTPS and secure cookie settings
- [ ] Configure proper database connection pooling
- [ ] Set up proper logging with log rotation
- [ ] Implement health check endpoints
- [ ] Configure production-ready Kafka cluster
- [ ] Set up monitoring and alerting
- [ ] Implement backup strategy for file uploads
- [ ] Configure proper CORS settings for production domain

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=carpool_db
DB_USERNAME=username
DB_PASSWORD=password

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Session
SESSION_TIMEOUT=1800
COOKIE_SECURE=true

# File Upload
MAX_FILE_SIZE=5MB
UPLOAD_PATH=/app/uploads
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

**Kafka Connection Issues**
```bash
# Check if Kafka services are running
docker-compose ps

# Restart Kafka services
docker-compose down
docker-compose up -d
```

**Session Authentication Issues**
- Ensure cookies are being sent with requests (`withCredentials: true`)
- Check CORS configuration includes credentials
- Verify session timeout settings

**Image Upload Issues**  
- Check file permissions for uploads directory
- Verify static resource configuration
- Ensure file size limits are properly set

**Database Connection Issues**
- Verify database credentials and connection string
- Check if MySQL service is running
- Ensure database exists and user has proper permissions

