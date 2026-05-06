/**
 * Migration: Create CampaignEvent Collection with Indexes
 * Date: 2026
 * Description: Creates the campaign_events collection with proper schema validation and indexes
 */

module.exports = {
    up: async (db) => {
        console.log('Running migration: Create CampaignEvent collection');

        // Create collection with validation schema
        await db.createCollection('campaign_events', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['candidateId', 'agentId', 'electionId', 'name', 'startDateTime', 'status'],
                    properties: {
                        _id: { bsonType: 'objectId' },
                        candidateId: {
                            bsonType: 'objectId',
                            description: 'Reference to the candidate'
                        },
                        agentId: {
                            bsonType: 'objectId',
                            description: 'Reference to the agent who scheduled'
                        },
                        electionId: {
                            bsonType: 'objectId',
                            description: 'Reference to the election'
                        },
                        name: {
                            bsonType: 'string',
                            description: 'Event name/title'
                        },
                        description: {
                            bsonType: ['string', 'null'],
                            description: 'Event details'
                        },
                        eventType: {
                            bsonType: 'string',
                            enum: ['rally', 'town_hall', 'press_conference', 'debate', 'meet_and_greet', 'other'],
                            description: 'Type of event'
                        },
                        startDateTime: {
                            bsonType: 'date',
                            description: 'When event starts'
                        },
                        endDateTime: {
                            bsonType: ['date', 'null'],
                            description: 'When event ends'
                        },
                        location: {
                            bsonType: 'object',
                            properties: {
                                venue: { bsonType: 'string' },
                                city: { bsonType: 'string' },
                                latitude: { bsonType: ['double', 'null'] },
                                longitude: { bsonType: ['double', 'null'] },
                                addressString: { bsonType: ['string', 'null'] }
                            }
                        },
                        status: {
                            bsonType: 'string',
                            enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'],
                            description: 'Event status'
                        },
                        isStreamed: {
                            bsonType: 'bool',
                            description: 'Whether event is being streamed'
                        },
                        streaming: {
                            bsonType: ['object', 'null'],
                            properties: {
                                provider: {
                                    bsonType: 'string',
                                    enum: ['youtube', 'facebook', 'twitch']
                                },
                                streamUrl: { bsonType: 'string' },
                                viewerCount: { bsonType: 'int' }
                            }
                        },
                        attendance: {
                            bsonType: 'object',
                            properties: {
                                registrations: {
                                    bsonType: 'array',
                                    items: {
                                        bsonType: 'object',
                                        properties: {
                                            userId: { bsonType: 'objectId' },
                                            name: { bsonType: 'string' },
                                            email: { bsonType: 'string' },
                                            registeredAt: { bsonType: 'date' },
                                            checkedIn: { bsonType: 'bool' },
                                            checkedInAt: { bsonType: ['date', 'null'] }
                                        }
                                    }
                                }
                            }
                        },
                        media: {
                            bsonType: ['object', 'null'],
                            properties: {
                                imageUrls: {
                                    bsonType: 'array',
                                    items: { bsonType: 'string' }
                                },
                                videoUrls: {
                                    bsonType: 'array',
                                    items: { bsonType: 'string' }
                                }
                            }
                        },
                        budget: {
                            bsonType: ['object', 'null'],
                            properties: {
                                estimated: { bsonType: 'double' },
                                actual: { bsonType: ['double', 'null'] },
                                currency: { bsonType: 'string' }
                            }
                        },
                        createdAt: {
                            bsonType: 'date'
                        },
                        updatedAt: {
                            bsonType: 'date'
                        }
                    }
                }
            }
        });

        // Create indexes for performance
        const collection = db.collection('campaign_events');

        // Index 1: Candidate events by date
        await collection.createIndex(
            { candidateId: 1, startDateTime: 1 },
            {
                name: 'idx_candidate_events_date',
                background: true
            }
        );

        // Index 2: Election events by status
        await collection.createIndex(
            { electionId: 1, status: 1 },
            {
                name: 'idx_election_events_status',
                background: true
            }
        );

        // Index 3: Upcoming events (for discovery)
        await collection.createIndex(
            { status: 1, startDateTime: 1 },
            {
                name: 'idx_upcoming_events',
                partialFilterExpression: {
                    status: { $in: ['scheduled', 'ongoing'] },
                    startDateTime: { $gte: new Date() }
                },
                background: true
            }
        );

        // Index 4: Agent events
        await collection.createIndex(
            { agentId: 1, startDateTime: -1 },
            {
                name: 'idx_agent_events',
                background: true
            }
        );

        // Index 5: TTL index for completed events (optional - keep for 6 months)
        await collection.createIndex(
            { completedAt: 1 },
            {
                name: 'idx_ttl_completed_events',
                expireAfterSeconds: 15552000, // 6 months
                sparse: true,
                background: true
            }
        );

        console.log('✓ CampaignEvent collection created with indexes');
    },

    down: async (db) => {
        console.log('Rolling back migration: Create CampaignEvent collection');

        // Drop collection on rollback
        await db.dropCollection('campaign_events')
            .catch(err => {
                if (err.code !== 26) {
                    throw err; // Re-throw if it's not "namespace not found"
                }
            });

        console.log('✓ CampaignEvent collection dropped');
    }
};
