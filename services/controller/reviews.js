const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('proto/reviews.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const reviewsProto = grpc.loadPackageDefinition(packageDefinition);

module.exports = new reviewsProto.ReviewsService(
    'localhost:3003',
    grpc.credentials.createInsecure()
);