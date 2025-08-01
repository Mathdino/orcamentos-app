import type { DadosOrcamento } from "@/types/orcamento";

export async function gerarPDF(dados: DadosOrcamento, valorTotal: number) {
  try {
    // Importar jsPDF dinamicamente
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF();

    // Configurações
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = 30;

    // Carregar as logos
    const logoTopoUrl = "/logopdf.png";
    const logoFundoUrl = "/logopdf-transparente.png";
    // Carregar logo do topo
    const responseLogoTopo = await fetch(logoTopoUrl);
    if (!responseLogoTopo.ok) {
      throw new Error(
        `Erro ao carregar logo do topo: ${responseLogoTopo.status} ${responseLogoTopo.statusText}`
      );
    }
    const blobLogoTopo = await responseLogoTopo.blob();
    const base64LogoTopo = await new Promise<string>((resolve, reject) => {
      const reader: FileReader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () =>
        reject(new Error("Erro ao converter logo do topo para base64"));
      reader.readAsDataURL(blobLogoTopo);
    });
    // Carregar logo de fundo (marca d'água)
    const responseLogoFundo = await fetch(logoFundoUrl);
    if (!responseLogoFundo.ok) {
      throw new Error(
        `Erro ao carregar logo de fundo: ${responseLogoFundo.status} ${responseLogoFundo.statusText}`
      );
    }
    const blobLogoFundo = await responseLogoFundo.blob();
    const base64LogoFundo = await new Promise<string>((resolve, reject) => {
      const reader: FileReader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () =>
        reject(new Error("Erro ao converter logo de fundo para base64"));
      reader.readAsDataURL(blobLogoFundo);
    });

    // Função para adicionar a marca d'água de fundo
    function adicionarMarcaDagua(
      doc: any,
      base64: string,
      pageWidth: number,
      pageHeight: number
    ) {
      const imgWidth = pageWidth * 0.7;
      const imgHeight = imgWidth * 0.5;
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      doc.addImage(base64, "PNG", x, y, imgWidth, imgHeight, undefined, "FAST");
      // Suavizar a marca d'água
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0);
      doc.setGState && doc.setGState(new doc.GState({ opacity: 0.2 }));
      for (let i = 0; i < 2; i++) {
        doc.rect(x, y, imgWidth, imgHeight, "F");
      }
      if (doc.setGState) doc.setGState(new doc.GState({ opacity: 1 }));
    }

    // Adiciona marca d'água em todas as páginas ao adicionar nova página
    const originalAddPage = doc.addPage.bind(doc);
    doc.addPage = function () {
      originalAddPage();
      adicionarMarcaDagua(doc, base64LogoFundo, pageWidth, pageHeight);
      return doc;
    };

    // Adicionar marca d'água na primeira página
    adicionarMarcaDagua(doc, base64LogoFundo, pageWidth, pageHeight);

    // Barra superior
    doc.setFillColor(8, 13, 16); // Verde preto
    doc.rect(0, 0, pageWidth, 40, "F");
    // Linha colorida abaixo
    doc.setFillColor(147, 190, 75); // Verde mais claro
    doc.rect(0, 40, pageWidth, 4, "F");

    // Logo no topo à esquerda - ajustado para não ficar tão expandido
    doc.addImage(base64LogoTopo, "PNG", margin, 16, 32, 8, undefined, "FAST");

    // Título no topo
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Orçamento de Obra", pageWidth / 2, 22, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Data no topo direito
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.text(
      `Data: ${new Date().toLocaleDateString("pt-BR")}`,
      pageWidth - margin,
      16,
      { align: "right" }
    );
    doc.setTextColor(0, 0, 0);

    yPosition = 50;

    // Função utilitária para checar e quebrar página se necessário
    function checkPageBreak(doc: any, yPosition: number, spaceNeeded: number) {
      if (yPosition + spaceNeeded > pageHeight - 30) {
        // 30 para rodapé
        doc.addPage();
        return 50; // y inicial após quebra
      }
      return yPosition;
    }

    // Função utilitária para converter datas em formato brasileiro (dd/mm/yyyy) para Date
    function parseDataBR(data: string) {
      // Se vier no formato dd/mm/yyyy
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
        const [dia, mes, ano] = data.split("/");
        // Cria a data no horário do meio-dia para evitar problemas de timezone
        return new Date(Number(ano), Number(mes) - 1, Number(dia), 12, 0, 0);
      }
      // Se vier no formato ISO yyyy-mm-dd ou yyyy-mm-ddTHH:MM:SS
      if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
        const [ano, mes, dia] = data.split("T")[0].split("-");
        return new Date(Number(ano), Number(mes) - 1, Number(dia), 12, 0, 0);
      }
      return new Date(data);
    }

    // Seção: Dados do Cliente
    yPosition = checkPageBreak(doc, yPosition, 30);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Informações do Cliente", margin, yPosition);
    yPosition += 4;
    doc.setDrawColor(127, 170, 55); // Verde #7faa37
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    // Nome e CPF/CNPJ na mesma linha
    doc.text(`Nome: ${dados.cliente.nome}`, margin, yPosition);
    let docIdLabel = "-";
    if (dados.cliente.tipo === "fisica" && dados.cliente.cpf) {
      docIdLabel = `CPF: ${dados.cliente.cpf}`;
    } else if (dados.cliente.tipo === "juridica" && dados.cliente.cnpj) {
      docIdLabel = `CNPJ: ${dados.cliente.cnpj}`;
    }
    doc.text(docIdLabel, pageWidth / 2 + 10, yPosition);
    yPosition += 7;
    doc.text(`Telefone: ${dados.cliente.telefone}`, margin, yPosition);
    yPosition += 7;
    // Endereço completo
    let enderecoCliente = `${dados.cliente.endereco}, ${dados.cliente.numero}`;
    if (dados.cliente.bairro)
      enderecoCliente += `, Bairro: ${dados.cliente.bairro}`;
    if (dados.cliente.complemento)
      enderecoCliente += ` - ${dados.cliente.complemento}`;
    enderecoCliente += `, CEP: ${dados.cliente.cep}`;
    doc.text(`Endereço: ${enderecoCliente}`, margin, yPosition);
    yPosition += 15;

    // Seção: Dados da Obra
    yPosition = checkPageBreak(doc, yPosition, 40);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Informações da Obra", margin, yPosition);
    yPosition += 4;
    doc.setDrawColor(127, 170, 55); // Verde #7faa37
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    // Local da obra
    doc.text(`Local da Obra: ${dados.localObra}`, margin, yPosition);
    yPosition += 7;
    // Tipo de metragem e valor
    doc.text(
      `Tipo de Metragem: ${
        dados.tipoMetragem === "metro"
          ? "Por Metro Quadrado"
          : "Empreita (Valor Fechado)"
      }`,
      margin,
      yPosition
    );
    yPosition += 7;
    if (dados.tipoMetragem === "metro") {
      doc.text(`Metragem: ${dados.metragem} m²`, margin, yPosition);
      yPosition += 7;
    } else if (dados.tipoMetragem === "empreita") {
      doc.text(
        `Valor da Empreita: R$ ${(dados.valorEmpreita || 0).toFixed(2)}`,
        margin,
        yPosition
      );
      yPosition += 7;
    }
    doc.text(`Tempo estimado: ${dados.tempoObra} dias`, margin, yPosition);
    // Tipo de serviço
    const servicoLabels: Record<string, string> = {
      pintura_residencial_predial: "Pintura residencial e predial",
      massa_corrida_acrilica: "Aplicação de massa corrida e acrílica",
      aplicacao_texturas: "Aplicação de texturas",
      efeitos_decorativos: "Efeitos decorativos",
      cimento_queimado: "Cimento queimado",
      aco_corten: "Aço corten",
      pedras_naturais: "Pedras naturais",
      efeito_tijolinho: "Efeito tijolinho",
      efeito_marmore: "Efeito mármore",
    };
    doc.text(
      `Tipo de serviço: ${
        servicoLabels[dados.tipoServico as string] || dados.tipoServico || "-"
      }`,
      pageWidth / 2 + 10,
      yPosition
    );
    yPosition += 7;
    // Detalhes e especificações
    const detalhesLines = doc.splitTextToSize(
      `Detalhes: ${dados.detalhesEspaco}`,
      pageWidth - 2 * margin
    );
    yPosition = checkPageBreak(doc, yPosition, detalhesLines.length * 7);
    doc.text(detalhesLines, margin, yPosition);
    yPosition += detalhesLines.length * 7;
    if (dados.especificacoes) {
      const especLines = doc.splitTextToSize(
        `Especificações: ${dados.especificacoes}`,
        pageWidth - 2 * margin
      );
      yPosition = checkPageBreak(doc, yPosition, especLines.length * 7);
      doc.text(especLines, margin, yPosition);
      yPosition += especLines.length * 7;
    }
    yPosition += 10;

    // Seção: Materiais
    yPosition = checkPageBreak(doc, yPosition, 40);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Materiais", margin, yPosition);
    yPosition += 4;
    doc.setDrawColor(127, 170, 55); // Verde #7faa37
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Material", margin, yPosition);
    doc.text("Marca", margin + 60, yPosition);
    doc.text("Qtd", margin + 100, yPosition);
    doc.text("Unit.", margin + 120, yPosition);
    doc.text("Valor Unit.", margin + 140, yPosition);
    doc.text("Total", margin + 170, yPosition);
    yPosition += 7;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    let valorMateriais = 0;
    dados.materiais.forEach((material, idx) => {
      yPosition = checkPageBreak(doc, yPosition, 7);
      doc.text(material.nome.substring(0, 15), margin, yPosition);
      doc.text(material.marca.substring(0, 12), margin + 60, yPosition);
      doc.text(material.quantidade.toString(), margin + 100, yPosition);
      doc.text(material.unidade, margin + 120, yPosition);
      doc.text(`R$ ${material.valorUnit.toFixed(2)}`, margin + 140, yPosition);
      doc.text(`R$ ${material.valorTotal.toFixed(2)}`, margin + 170, yPosition);
      valorMateriais += material.valorTotal;
      yPosition += 7;
    });
    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // NOVA SEÇÃO: Informações da obra
    // Título
    yPosition = checkPageBreak(doc, yPosition, 40);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Informações da obra", margin, yPosition);
    yPosition += 4;
    doc.setDrawColor(127, 170, 55); // Verde #7faa37
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    // Datas
    if (dados.dataInicioObra) {
      const dataInicio = new Date(dados.dataInicioObra);
      dataInicio.setHours(dataInicio.getHours() + 3);
      const dataInicioFormatada = dataInicio.toLocaleDateString("pt-BR");
      doc.text(`Data de início: ${dataInicioFormatada}`, margin, yPosition);
      yPosition += 7;
    }
    if (dados.dataTerminoObra) {
      const dataTermino = new Date(dados.dataTerminoObra);
      dataTermino.setHours(dataTermino.getHours() + 3);
      const dataTerminoFormatada = dataTermino.toLocaleDateString("pt-BR");
      doc.text(`Data de término: ${dataTerminoFormatada}`, margin, yPosition);
      yPosition += 7;
    }
    // Exibir valores de mão de obra logo abaixo da data de término
    const valorPintorPrincipal =
      (dados.valorDiariaPrincipal || 0) * (dados.diasPrincipal || 1);
    doc.text(
      `Mão de Obra do Pintor Principal: R$ ${valorPintorPrincipal.toFixed(2)}`,
      margin,
      yPosition
    );
    yPosition += 7;
    if (dados.ajudantes && dados.ajudantes.length > 0) {
      doc.text("Ajudantes:", margin, yPosition);
      yPosition += 7;
      dados.ajudantes.forEach((aj) => {
        const totalAj = (aj.valorDiaria || 0) * (aj.dias || 1);
        doc.text(
          `- ${aj.nome || "Ajudante"}: R$ ${(aj.valorDiaria || 0).toFixed(
            2
          )} x ${aj.dias || 1} dia(s) = R$ ${totalAj.toFixed(2)}`,
          margin + 10,
          yPosition
        );
        yPosition += 7;
      });
    }

    // Calcular valorLucro e totalGeral antes das seções
    let valorLucro = 0;
    let totalGeral = 0;
    if (dados.tipoMetragem === "empreita" && dados.valorEmpreita) {
      valorLucro = 0; // Não há lucro separado em empreita
      totalGeral = valorMateriais + dados.valorEmpreita + (dados.lucro || 0);
    } else {
      valorLucro = typeof dados.lucro === "number" ? dados.lucro : 0;
      totalGeral = valorMateriais + dados.valorMaoObra + valorLucro;
    }

    // Remover a seção antiga de detalhamento da mão de obra

    // NOVA SEÇÃO: Valor total
    yPosition = checkPageBreak(doc, yPosition, 20);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Valor total", margin, yPosition);
    yPosition += 4;
    doc.setDrawColor(127, 170, 55); // Verde #7faa37
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Subtotal Materiais: R$ ${valorMateriais.toFixed(2)}`,
      margin,
      yPosition
    );
    yPosition += 12;
    if (dados.tipoMetragem === "empreita") {
      doc.text(
        `Subtotal Mão de Obra: R$ ${(dados.lucro || 0).toFixed(2)}`,
        margin,
        yPosition
      );
    } else {
      doc.text(
        `Subtotal Mão de Obra: R$ ${dados.valorMaoObra.toFixed(2)}`,
        margin,
        yPosition
      );
    }
    yPosition += 12;
    if (dados.tipoMetragem !== "empreita" && valorLucro > 0) {
      doc.text(`Valor da Obra: R$ ${valorLucro.toFixed(2)}`, margin, yPosition);
      yPosition += 12;
    } else if (dados.tipoMetragem === "empreita" && dados.valorEmpreita) {
      doc.text(
        `Valor da Empreita: R$ ${dados.valorEmpreita.toFixed(2)}`,
        margin,
        yPosition
      );
      yPosition += 12;
    }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`, margin, yPosition);
    yPosition += 14;

    // Observações
    if (dados.observacoes) {
      yPosition += 20;
      yPosition = checkPageBreak(doc, yPosition, 30);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Observações Adicionais", margin, yPosition);
      yPosition += 7;
      doc.setDrawColor(127, 170, 55); // Verde #7faa37
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      const obsLines = doc.splitTextToSize(
        dados.observacoes,
        pageWidth - 2 * margin
      );
      yPosition = checkPageBreak(doc, yPosition, obsLines.length * 7);
      doc.text(obsLines, margin, yPosition);
    }

    // Rodapé
    // Sempre desenhar o rodapé na última página, se não couber, adicionar nova página
    const rodapeText = "Orçamento válido por 30 dias";
    const rodapeFontSize = 10;
    const rodapeY = doc.internal.pageSize.height - 30;
    doc.setFontSize(rodapeFontSize);
    doc.setFont("helvetica", "italic");
    // Se o yPosition já passou do rodapé, adiciona nova página
    if (yPosition > rodapeY - 10) {
      doc.addPage();
    }
    doc.text(rodapeText, pageWidth / 2, doc.internal.pageSize.height - 30, {
      align: "center",
    });

    // Salvar o PDF
    const fileName = `orcamento_${dados.cliente.nome.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);

    return { success: true, fileName, totalGeral };
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return { success: false, error: "Erro ao gerar PDF" };
  }
}
