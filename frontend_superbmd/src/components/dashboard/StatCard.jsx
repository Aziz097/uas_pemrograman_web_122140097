import React from 'react';

const StatCard = ({ title, value, icon: Icon, bgColor, textColor }) => {
    return (
        <div className={`p-6 rounded-lg shadow-lg flex items-center justify-between ${bgColor} ${textColor}`}>
            <div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-5xl font-bold">{value}</p>
            </div>
            {Icon && <Icon className="h-16 w-16 opacity-30" />}
        </div>
    );
};

export default StatCard;