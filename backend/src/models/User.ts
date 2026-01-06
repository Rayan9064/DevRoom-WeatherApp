import pool from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserDTO {
    username: string;
    email: string;
    password: string;
}

export interface UserResponse {
    id: number;
    username: string;
    email: string;
    created_at: Date;
}

class UserModel {
    /**
     * Create a new user
     */
    async create(userData: CreateUserDTO): Promise<UserResponse> {
        const { username, email, password } = userData;

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, created_at
        `;

        const values = [username, email, password_hash];
        const result = await pool.query(query, values);

        return result.rows[0];
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);

        return result.rows[0] || null;
    }

    /**
     * Find user by username
     */
    async findByUsername(username: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);

        return result.rows[0] || null;
    }

    /**
     * Find user by ID
     */
    async findById(id: number): Promise<UserResponse | null> {
        const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);

        return result.rows[0] || null;
    }

    /**
     * Verify user password
     */
    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Check if email exists
     */
    async emailExists(email: string): Promise<boolean> {
        const user = await this.findByEmail(email);
        return user !== null;
    }

    /**
     * Check if username exists
     */
    async usernameExists(username: string): Promise<boolean> {
        const user = await this.findByUsername(username);
        return user !== null;
    }
}

export default new UserModel();
