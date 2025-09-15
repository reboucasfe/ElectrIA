"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Fale Conosco</CardTitle>
          <CardDescription>Estamos aqui para ajudar! Entre em contato conosco.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Mail className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-gray-600">suporte@eletropropostaia.com.br</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Phone className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold">Telefone</h3>
              <p className="text-gray-600">(XX) XXXX-XXXX</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <MapPin className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold">Endereço</h3>
              <p className="text-gray-600">Rua Exemplo, 123, Cidade, Estado, Brasil</p>
            </div>
          </div>
          <p className="text-sm text-center text-gray-500 mt-8">
            Preencha nosso formulário de contato para um atendimento mais rápido. (Formulário em breve)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;