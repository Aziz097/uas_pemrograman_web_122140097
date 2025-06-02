import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const UserRoleSelector = ({ register, errors, defaultValue, disabled }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const roles = ['admin', 'penanggung_jawab', 'viewer'];

    return (
        <div>
            <label htmlFor="role" className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
            <select
                id="role"
                className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${errors.role ? 'border-red-500' : ''} ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'text-gray-700 border-gray-300'}`}
                {...register('role', { required: 'Role harus dipilih' })}
                defaultValue={defaultValue}
                disabled={disabled}
            >
                <option value="">Pilih Role</option>
                {roles.map(role => (
                    <option key={role} value={role}>{role.replace(/_/g, ' ').toUpperCase()}</option>
                ))}
            </select>
            {errors.role && <p className="text-red-500 text-xs italic mt-1">{errors.role.message}</p>}
        </div>
    );
};

export default UserRoleSelector;