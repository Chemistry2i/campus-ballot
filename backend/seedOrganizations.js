/**
 * Seed Federation and Universities
 * 
 * This script creates a sample federation with multiple member universities
 * for testing the multi-organization election system.
 * 
 * Usage: node seedOrganizations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const colors = require('colors');
const Organization = require('./models/Organization');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Sample data
const federationData = {
    name: 'National University Students Federation',
    code: 'NUSF',
    type: 'federation',
    description: 'The umbrella organization for all university student associations',
    contact: {
        email: 'info@nusf.org',
        phone: '+256700000000',
        website: 'https://nusf.org'
    },
    settings: {
        allowSelfRegistration: false,
        requireEmailVerification: true,
        allowFederationVoting: true,
        primaryColor: '#1a365d',
        secondaryColor: '#2b6cb0'
    }
};

const universitiesData = [
    {
        name: 'Kyambogo University',
        code: 'KYU',
        description: 'Kyambogo University Students Association',
        contact: {
            email: 'students@kyu.ac.ug',
            phone: '+256700100001',
            address: 'Kyambogo, Kampala',
            website: 'https://kyu.ac.ug'
        },
        settings: {
            primaryColor: '#1e7b34',
            secondaryColor: '#28a745'
        }
    },
    {
        name: 'Makerere University',
        code: 'MAK',
        description: 'Makerere University Students Guild',
        contact: {
            email: 'guild@mak.ac.ug',
            phone: '+256700100002',
            address: 'Makerere Hill, Kampala',
            website: 'https://mak.ac.ug'
        },
        settings: {
            primaryColor: '#6a1b9a',
            secondaryColor: '#9c4dcc'
        }
    },
    {
        name: 'Makerere University Business School',
        code: 'MUBS',
        description: 'MUBS Students Association',
        contact: {
            email: 'students@mubs.ac.ug',
            phone: '+256700100003',
            address: 'Nakawa, Kampala',
            website: 'https://mubs.ac.ug'
        },
        settings: {
            primaryColor: '#0277bd',
            secondaryColor: '#039be5'
        }
    },
    {
        name: 'Uganda Christian University',
        code: 'UCU',
        description: 'UCU Students Guild',
        contact: {
            email: 'guild@ucu.ac.ug',
            phone: '+256700100004',
            address: 'Mukono',
            website: 'https://ucu.ac.ug'
        },
        settings: {
            primaryColor: '#c62828',
            secondaryColor: '#e53935'
        }
    },
    {
        name: 'Ndejje University',
        code: 'NDU',
        description: 'Ndejje University Students Association',
        contact: {
            email: 'students@ndejjeuniversity.ac.ug',
            phone: '+256700100005',
            address: 'Ndejje, Luwero',
            website: 'https://ndejjeuniversity.ac.ug'
        },
        settings: {
            primaryColor: '#f57c00',
            secondaryColor: '#ff9800'
        }
    }
];

// Admin users to create
const adminUsers = [
    {
        name: 'Federation Super Admin',
        email: 'superadmin@nusf.org',
        password: 'FedAdmin@2026',
        role: 'super_admin',
        orgCode: 'NUSF'
    },
    {
        name: 'Federation Admin',
        email: 'admin@nusf.org',
        password: 'FedAdmin@2026',
        role: 'federation_admin',
        orgCode: 'NUSF'
    },
    {
        name: 'KYU Admin',
        email: 'admin@kyu.ac.ug',
        password: 'KyuAdmin@2026',
        role: 'admin',
        orgCode: 'KYU'
    },
    {
        name: 'MAK Admin',
        email: 'admin@mak.ac.ug',
        password: 'MakAdmin@2026',
        role: 'admin',
        orgCode: 'MAK'
    },
    {
        name: 'MUBS Admin',
        email: 'admin@mubs.ac.ug',
        password: 'MubsAdmin@2026',
        role: 'admin',
        orgCode: 'MUBS'
    }
];

async function seedOrganizations() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB'.green);

        // Check if federation already exists
        const existingFederation = await Organization.findOne({ code: 'NUSF' });
        
        let federation;
        if (existingFederation) {
            console.log('ℹ️  Federation already exists, skipping creation'.yellow);
            federation = existingFederation;
        } else {
            // Create federation
            federation = await Organization.create(federationData);
            console.log(`✅ Created federation: ${federation.name} (${federation.code})`.green);
        }

        // Create universities
        const orgMap = { 'NUSF': federation._id };
        
        for (const uniData of universitiesData) {
            const existing = await Organization.findOne({ code: uniData.code });
            
            if (existing) {
                console.log(`ℹ️  ${uniData.code} already exists, updating parent...`.yellow);
                existing.parent = federation._id;
                await existing.save();
                orgMap[uniData.code] = existing._id;
            } else {
                const university = await Organization.create({
                    ...uniData,
                    type: 'university',
                    parent: federation._id
                });
                orgMap[uniData.code] = university._id;
                console.log(`✅ Created university: ${university.name} (${university.code})`.green);
            }
        }

        // Create admin users
        console.log('\n📝 Creating admin users...'.cyan);
        
        for (const adminData of adminUsers) {
            const existingUser = await User.findOne({ email: adminData.email });
            
            if (existingUser) {
                console.log(`ℹ️  User ${adminData.email} already exists, updating organization...`.yellow);
                existingUser.organization = orgMap[adminData.orgCode];
                existingUser.role = adminData.role;
                await existingUser.save();
            } else {
                const hashedPassword = await bcrypt.hash(adminData.password, 10);
                await User.create({
                    name: adminData.name,
                    email: adminData.email,
                    password: hashedPassword,
                    role: adminData.role,
                    organization: orgMap[adminData.orgCode],
                    isVerified: true
                });
                console.log(`✅ Created ${adminData.role}: ${adminData.email}`.green);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60).cyan);
        console.log('📊 ORGANIZATION SETUP COMPLETE'.cyan.bold);
        console.log('='.repeat(60).cyan);
        
        const allOrgs = await Organization.find({}).populate('parent', 'name code');
        console.log(`\nTotal Organizations: ${allOrgs.length}`);
        console.log('\nFederation:');
        console.log(`  - ${federation.name} (${federation.code})`);
        console.log('\nMember Universities:');
        allOrgs.filter(o => o.type === 'university').forEach(u => {
            console.log(`  - ${u.name} (${u.code})`);
        });

        console.log('\n📋 Admin Credentials:'.yellow);
        console.log('='.repeat(40));
        adminUsers.forEach(admin => {
            console.log(`${admin.role}: ${admin.email}`);
            console.log(`Password: ${admin.password}`);
            console.log('-'.repeat(40));
        });

        console.log('\n✅ Seeding completed successfully!'.green.bold);
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:'.red, error);
        process.exit(1);
    }
}

seedOrganizations();
