export const getTranslatedErrorMessage = (originalMessage: string): string => {
  switch (originalMessage) {
    case 'Invalid login credentials':
      return 'Credenciais de login inválidas. Verifique seu e-mail e senha.';
    case 'Email not confirmed':
      return 'Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada.';
    case 'User already registered':
      return 'Este e-mail já está cadastrado. Por favor, faça login ou use outro e-mail.';
    case 'Email link is invalid or has expired':
      return 'O link de redefinição de senha é inválido ou expirou.';
    case 'Password should be at least 6 characters':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'Unable to validate email address: invalid format':
      return 'Formato de e-mail inválido.';
    case 'Failed to fetch':
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    case 'Network request failed':
      return 'Falha na requisição de rede. Verifique sua conexão.';
    case 'Auth session missing!':
      return 'Sessão de autenticação ausente. Por favor, faça login novamente.';
    case 'For security purposes, you can only request a password reset every 60 seconds':
      return 'Por motivos de segurança, você só pode solicitar a redefinição de senha a cada 60 segundos.';
    case 'Email rate limit exceeded':
      return 'Limite de envio de e-mails excedido. Tente novamente mais tarde.';
    case 'User not found':
      return 'Usuário não encontrado.';
    case 'Cannot update password for a user that never signed in with a password':
      return 'Não é possível atualizar a senha para um usuário que nunca fez login com uma senha (ex: login social).';
    default:
      // Para erros não mapeados, retornamos uma mensagem genérica com o erro original para depuração.
      return `Ocorreu um erro: ${originalMessage}`;
  }
};