package com.helloworld.hello_world_grpc;

import org.springframework.grpc.server.service.GrpcService;

//import org.springframework.grpc.server.service.GrpcService;

import com.grpc.HelloRequest;
import com.grpc.HelloResponse;
import com.grpc.HelloWorldServiceGrpc;

import io.grpc.stub.StreamObserver;

@GrpcService
public class HelloWorldServiceImpl extends HelloWorldServiceGrpc.HelloWorldServiceImplBase{
    @Override
    public void helloWorld(HelloRequest request, StreamObserver<HelloResponse> response){
        HelloResponse resp =  HelloResponse.newBuilder().setHelloWorld(request.getHelloWorld()).build();
        response.onNext(resp);
        response.onCompleted();
    }
}