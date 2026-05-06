/**
 * Migration: Create CampaignMessage Collection with Indexes
 * Date: 2026
 * Description: Creates the campaign_messages collection with proper schema validation and indexes
 */

module.exports = {
    up: async (db) => {
        console.log('Running migration: Create CampaignMessage collection');

        // Create collection with validation schema
        await db.createCollection('campaign_messages', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['candidateId', 'agentId', 'electionId', 'text', 'postedAt', 'status'],
                    properties: {
                        _id: { bsonType: 'objectId' },
                        candidateId: {
                            bsonType: 'objectId',
                            description: 'Reference to the candidate'
                        },
                        agentId: {
                            bsonType: 'objectId',
                            description: 'Reference to the agent who posted'
                        },
                        electionId: {
                            bsonType: 'objectId',
                            description: 'Reference to the election'
                        },
                        text: {
                            bsonType: 'string',
                            description: 'Message content'
                        },
                        messageType: {
                            bsonType: 'string',
                            enum: ['announcement', 'update', 'question_response', 'event_info', 'other'],
                            description: 'Type of message'
                        },
                        visibility: {
                            bsonType: 'string',
                            enum: ['public', 'followers_only', 'private'],
                            description: 'Who can see this message'
                        },
                        status: {
                            bsonType: 'string',
                            enum: ['published', 'scheduled', 'draft', 'archived'],
                            description: 'Publication status'
                        },
                        postedAt: {
                            bsonType: 'date',
                            description: 'When message was posted (immutable)'
                        },
                        scheduledFor: {
                            bsonType: ['date', 'null'],
                            description: 'When to publish if scheduled'
                        },
                        engagement: {
                            bsonType: 'object',
                            properties: {
                                likes: {
                                    bsonType: 'array',
                                    items: { bsonType: 'objectId' }
                                },
                                shares: {
                                    bsonType: 'array',
                                    items: { bsonType: 'objectId' }
                                },
                                replies: {
                                    bsonType: 'array',
                                    items: { bsonType: 'object' }
                                }
                            }
                        },
                        metadata: {
                            bsonType: ['object', 'null'],
                            description: 'Additional metadata'
                        },
                        createdAt: {
                            bsonType: 'date',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            bsonType: 'date',
                            description: 'Last update timestamp'
                        }
                    }
                }
            }
        });

        // Create indexes for performance
        const collection = db.collection('campaign_messages');

        // Index 1: Candidate messages sorted by date
        await collection.createIndex(
            { candidateId: 1, postedAt: -1 },
            {
                name: 'idx_candidate_messages_date',
                background: true
            }
        );

        // Index 2: Agent messages sorted by date
        await collection.createIndex(
            { agentId: 1, postedAt: -1 },
            {
                name: 'idx_agent_messages_date',
                background: true
            }
        );

        // Index 3: Election messages by status
        await collection.createIndex(
            { electionId: 1, status: 1 },
            {
                name: 'idx_election_messages_status',
                background: true
            }
        );

        // Index 4: TTL index for archived messages (optional - delete after 90 days)
        await collection.createIndex(
            { archivedAt: 1 },
            {
                name: 'idx_ttl_archived_messages',
                expireAfterSeconds: 7776000, // 90 days
                sparse: true,
                background: true
            }
        );

        console.log('✓ CampaignMessage collection created with indexes');
    },

    down: async (db) => {
        console.log('Rolling back migration: Create CampaignMessage collection');

        // Drop collection on rollback
        await db.dropCollection('campaign_messages')
            .catch(err => {
                if (err.code !== 26) {
                    throw err; // Re-throw if it's not "namespace not found"
                }
            });

        console.log('✓ CampaignMessage collection dropped');
    }
};
