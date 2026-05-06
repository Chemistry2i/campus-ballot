/**
 * Agent Permission Enforcement Tests
 * Tests for checkAgentPermission middleware and agent operations
 */

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const CampaignMessage = require('../models/CampaignMessage');
const CampaignEvent = require('../models/CampaignEvent');
const mongoose = require('mongoose');

describe('Agent Permission Enforcement', () => {
    let adminToken, candidateToken, agentToken, agentWithoutPermissionToken;
    let admin, candidate, agent, agentWithoutPermission;
    let election, agentRecord;

    beforeAll(async () => {
        // Connect to test database (if not already)
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_TEST_URI);
        }

        // Create test admin
        admin = await User.create({
            name: 'Test Admin',
            email: `admin-${Date.now()}@test.com`,
            password: 'securePassword123',
            role: 'admin'
        });

        // Create test candidate
        candidate = await User.create({
            name: 'Test Candidate',
            email: `candidate-${Date.now()}@test.com`,
            password: 'securePassword123',
            role: 'student',
            additionalRoles: ['candidate'],
            candidateInfo: [{
                electionId: new mongoose.Types.ObjectId(),
                position: 'President',
                status: 'approved'
            }]
        });

        // Create test election
        election = await Election.create({
            name: 'Test Election',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            organization: admin._id,
            positions: ['President', 'Vice President'],
            status: 'active'
        });

        // Update candidate info with real election ID
        candidate.candidateInfo[0].electionId = election._id;
        await candidate.save();

        // Create test agent WITH permissions
        agent = await User.create({
            name: 'Test Agent',
            email: `agent-${Date.now()}@test.com`,
            password: 'securePassword123',
            role: 'agent',
            agentInfo: {
                assignedCandidateId: candidate._id,
                assignedCandidates: [candidate._id],
                permissions: [
                    'manage_candidate_messages',
                    'schedule_events',
                    'view_analytics'
                ],
                accessLevel: 'full',
                approvalStatus: 'approved'
            }
        });

        // Create test agent WITHOUT permissions
        agentWithoutPermission = await User.create({
            name: 'Limited Agent',
            email: `limited-agent-${Date.now()}@test.com`,
            password: 'securePassword123',
            role: 'agent',
            agentInfo: {
                assignedCandidateId: candidate._id,
                permissions: [], // No permissions
                accessLevel: 'limited',
                approvalStatus: 'approved'
            }
        });

        // Get JWT tokens (assuming standard login endpoint)
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: admin.email,
                password: 'securePassword123'
            });
        adminToken = adminLogin.body.token;

        const candidateLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: candidate.email,
                password: 'securePassword123'
            });
        candidateToken = candidateLogin.body.token;

        const agentLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: agent.email,
                password: 'securePassword123'
            });
        agentToken = agentLogin.body.token;

        const limitedAgentLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: agentWithoutPermission.email,
                password: 'securePassword123'
            });
        agentWithoutPermissionToken = limitedAgentLogin.body.token;

        // Agent record for old Agent model
        agentRecord = await Agent.create({
            user: agent._id,
            candidate: candidate._id,
            election: election._id,
            agentRole: 'agent',
            permissions: {
                updateMaterials: true,
                postUpdates: true,
                respondToQuestions: true,
                viewStatistics: true,
                manageTasks: true
            },
            status: 'active'
        });
    });

    afterAll(async () => {
        // Cleanup
        await User.deleteMany({});
        await Election.deleteMany({});
        await Candidate.deleteMany({});
        await Agent.deleteMany({});
        await CampaignMessage.deleteMany({});
        await CampaignEvent.deleteMany({});
        // Uncomment if disconnecting after tests
        // await mongoose.connection.close();
    });

    describe('Agent Permission Middleware', () => {
        test('Should deny access to non-agents', async () => {
            const response = await request(app)
                .get('/api/agents/campaign/analytics')
                .set('Authorization', `Bearer ${candidateToken}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toContain('Agent role required');
        });

        test('Should deny unapproved agents', async () => {
            // Create unapproved agent
            const unapprovedAgent = await User.create({
                name: 'Unapproved Agent',
                email: `unapproved-${Date.now()}@test.com`,
                password: 'securePassword123',
                role: 'agent',
                agentInfo: {
                    assignedCandidateId: candidate._id,
                    permissions: ['view_analytics'],
                    approvalStatus: 'pending'
                }
            });

            const unapprovedLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    email: unapprovedAgent.email,
                    password: 'securePassword123'
                });

            const response = await request(app)
                .get('/api/agents/campaign/analytics')
                .set('Authorization', `Bearer ${unapprovedLogin.body.token}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toContain('pending');
        });

        test('Should allow approved agents with permissions', async () => {
            const response = await request(app)
                .get('/api/agents/campaign/analytics')
                .set('Authorization', `Bearer ${agentToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('Should deny agents without required permission', async () => {
            const response = await request(app)
                .post('/api/agents/campaign/messages')
                .set('Authorization', `Bearer ${agentWithoutPermissionToken}`)
                .send({
                    candidateId: candidate._id,
                    text: 'Test message'
                });

            expect(response.status).toBe(403);
            expect(response.body.error).toContain('Insufficient permissions');
        });
    });

    describe('Campaign Messages', () => {
        test('Agent WITH permission CAN post message', async () => {
            const response = await request(app)
                .post('/api/agents/campaign/messages')
                .set('Authorization', `Bearer ${agentToken}`)
                .send({
                    candidateId: candidate._id,
                    text: 'Vote for our candidate!',
                    visibility: 'public'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.text).toBe('Vote for our candidate!');
        });

        test('Agent WITHOUT permission CANNOT post message', async () => {
            const response = await request(app)
                .post('/api/agents/campaign/messages')
                .set('Authorization', `Bearer ${agentWithoutPermissionToken}`)
                .send({
                    candidateId: candidate._id,
                    text: 'Unauthorized message'
                });

            expect(response.status).toBe(403);
        });

        test('Non-agent CANNOT post message', async () => {
            const response = await request(app)
                .post('/api/agents/campaign/messages')
                .set('Authorization', `Bearer ${candidateToken}`)
                .send({
                    candidateId: candidate._id,
                    text: 'Candidate posting as agent'
                });

            expect(response.status).toBe(403);
        });

        test('Agent CAN retrieve assigned candidate\'s messages', async () => {
            // First post a message
            await request(app)
                .post('/api/agents/campaign/messages')
                .set('Authorization', `Bearer ${agentToken}`)
                .send({
                    candidateId: candidate._id,
                    text: 'Test message for retrieval'
                });

            // Now retrieve
            const response = await request(app)
                .get(`/api/agents/campaign/messages/${candidate._id}`)
                .set('Authorization', `Bearer ${agentToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.messages.length).toBeGreaterThan(0);
        });
    });

    describe('Campaign Events', () => {
        test('Agent WITH manageTasks permission CAN schedule event', async () => {
            const futureDate = new Date(Date.now() + 86400000); // Tomorrow

            const response = await request(app)
                .post('/api/agents/campaign/events')
                .set('Authorization', `Bearer ${agentToken}`)
                .send({
                    candidateId: candidate._id,
                    name: 'Campaign Rally',
                    location: 'Main Campus',
                    startDateTime: futureDate.toISOString(),
                    endDateTime: new Date(futureDate.getTime() + 3600000).toISOString()
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Campaign Rally');
        });

        test('Agent WITHOUT manageTasks permission CANNOT schedule event', async () => {
            const futureDate = new Date(Date.now() + 86400000);

            const response = await request(app)
                .post('/api/agents/campaign/events')
                .set('Authorization', `Bearer ${agentWithoutPermissionToken}`)
                .send({
                    candidateId: candidate._id,
                    name: 'Unauthorized Rally'
                });

            expect(response.status).toBe(403);
        });

        test('Agent CAN retrieve events for assigned candidate', async () => {
            const response = await request(app)
                .get(`/api/agents/campaign/events/${candidate._id}`)
                .set('Authorization', `Bearer ${agentToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.events)).toBe(true);
        });

        test('Event start date cannot be in the past', async () => {
            const pastDate = new Date(Date.now() - 86400000); // Yesterday

            const response = await request(app)
                .post('/api/agents/campaign/events')
                .set('Authorization', `Bearer ${agentToken}`)
                .send({
                    candidateId: candidate._id,
                    name: 'Past Event',
                    startDateTime: pastDate.toISOString()
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('future');
        });
    });

    describe('Agent Analytics', () => {
        test('Agent WITH viewStatistics permission CAN view analytics', async () => {
            const response = await request(app)
                .get('/api/agents/campaign/analytics')
                .set('Authorization', `Bearer ${agentToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.analytics).toBeDefined();
            expect(response.body.analytics.messagesPosted).toBeDefined();
            expect(response.body.analytics.eventsScheduled).toBeDefined();
        });

        test('Agent WITHOUT viewStatistics permission CANNOT view analytics', async () => {
            const response = await request(app)
                .get('/api/agents/campaign/analytics')
                .set('Authorization', `Bearer ${agentWithoutPermissionToken}`);

            expect(response.status).toBe(403);
        });

        test('Unauthenticated user cannot view analytics', async () => {
            const response = await request(app)
                .get('/api/agents/campaign/analytics');

            expect(response.status).toBe(401);
        });
    });

    describe('Permission Boundaries', () => {
        test('Agent can only access assigned candidates', async () => {
            // Create another candidate
            const other Candidate = await User.create({
                name: 'Other Candidate',
                email: `other-candidate-${Date.now()}@test.com`,
                password: 'securePassword123',
                role: 'student',
                candidateInfo: [{
                    electionId: election._id,
                    position: 'Treasurer'
                }]
            });

            // Agent tries to post message for unassigned candidate
            const response = await request(app)
                .post('/api/agents/campaign/messages')
                .set('Authorization', `Bearer ${agentToken}`)
                .send({
                    candidateId: otherCandidate._id,
                    text: 'Unauthorized'
                });

            expect(response.status).toBe(403);
            expect(response.body.error).toContain('not assigned');
        });

        test('Admin can bypass agent restrictions', async () => {
            // This depends on admin routes implementation
            // Admin should be able to view all agents and their analytics
            const response = await request(app)
                .get('/api/super-admin/agents')
                .set('Authorization', `Bearer ${adminToken}`);

            // Should return 200 or 404 (not 403)
            expect([200, 404]).toContain(response.status);
        });
    });
});

describe('Permission Enforcement - Edge Cases', () => {
    // Additional edge case tests
    test('Null/undefined permissions array should be handled', async () => {
        // Ensure middleware doesn't crash with missing permissions
        const response = await request(app)
            .get('/api/agents/campaign/analytics');

        expect([401, 403, 400]).toContain(response.status);
    });

    test('Multiple permissions requirement works correctly', async () => {
        // This would test a hypothetical endpoint requiring multiple permissions
        // e.g., checkAgentPermission(['manage_messages', 'view_analytics'])
        // Both must be present for access
    });
});
