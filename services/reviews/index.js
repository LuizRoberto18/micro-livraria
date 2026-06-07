const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync("proto/reviews.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const reviewsProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();
//dados mockados
const reviews = [
    { productId: 1, author: "Ana",   comment: "Excelente produto!",                      rating: 5 },
    { productId: 1, author: "Bruno", comment: "Muito bom, mas poderia ser melhor.",       rating: 4 },
    { productId: 2, author: "Carla", comment: "Produto ok, mas não atendeu expectativas.", rating: 3 },
];

server.addService(reviewsProto.ReviewsService.service, {
    GetReviews:(payload, callback) => {
        const id = parseInt(payload.request.product_id);
        callback(null, {reviews: reviews.filter(r => r.productId === id)});
    }
});

server.bindAsync(
    '0.0.0.0:3003',grpc.ServerCredentials.createInsecure(), () =>{
        console.log('Reviews service running at http://127.0.0.1:3003');
        server.start();
    }
);