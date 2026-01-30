import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { UnifiedModal, type ModalSection } from '../UnifiedModal';

// Mantineコンポーネントのモック
jest.mock('@mantine/core', () => ({
  Modal: ({ children, opened, title, ...props }: { children: React.ReactNode; opened: boolean; title?: string }) => (
    opened ? <div data-testid="modal" {...props}><h1>{title}</h1>{children}</div> : null
  ),
  Stack: ({ children, gap }: { children: React.ReactNode; gap?: string }) => (
    <div data-testid="stack" data-gap={gap}>{children}</div>
  ),
  Divider: ({ label, labelPosition, mb }: { label?: string; labelPosition?: string; mb?: string }) => (
    <hr data-testid="divider" data-label={label} data-position={labelPosition} data-mb={mb} />
  ),
}));

describe('UnifiedModal Component', () => {
  it('should render with children prop (backward compatibility)', () => {
    render(
      <UnifiedModal opened={true} onClose={() => {}} title="Test Modal">
        <div>Test content</div>
      </UnifiedModal>
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render with sections prop', () => {
    const sections: ModalSection[] = [
      {
        label: 'Section 1',
        content: <div>Content 1</div>,
      },
      {
        label: 'Section 2',
        content: <div>Content 2</div>,
      },
    ];

    render(
      <UnifiedModal opened={true} onClose={() => {}} title="Sections Modal" sections={sections} />
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('should insert dividers between sections', () => {
    const sections: ModalSection[] = [
      {
        label: 'First Section',
        content: <div>First</div>,
      },
      {
        label: 'Second Section',
        content: <div>Second</div>,
      },
      {
        label: 'Third Section',
        content: <div>Third</div>,
      },
    ];

    render(
      <UnifiedModal opened={true} onClose={() => {}} title="Multi-section Modal" sections={sections} />
    );

    const dividers = screen.getAllByTestId('divider');
    // 最初のセクションにラベルがあるため1つ、2番目のセクション前に1つ、3番目のセクション前に1つ、合計3つ
    expect(dividers.length).toBe(3);
    
    // ラベルの確認
    expect(dividers[0]).toHaveAttribute('data-label', 'First Section');
    expect(dividers[1]).toHaveAttribute('data-label', 'Second Section');
    expect(dividers[2]).toHaveAttribute('data-label', 'Third Section');
  });

  it('should handle sections without labels', () => {
    const sections: ModalSection[] = [
      {
        content: <div>No label content 1</div>,
      },
      {
        label: 'With Label',
        content: <div>With label content</div>,
      },
    ];

    render(
      <UnifiedModal opened={true} onClose={() => {}} title="Mixed Sections" sections={sections} />
    );

    expect(screen.getByText('No label content 1')).toBeInTheDocument();
    expect(screen.getByText('With label content')).toBeInTheDocument();
    
    // 最初のセクションにラベルなしのため0個、2番目のセクション(index > 0)のため1個、合計1つ
    const dividers = screen.getAllByTestId('divider');
    expect(dividers.length).toBe(1);
    expect(dividers[0]).toHaveAttribute('data-label', 'With Label');
  });

  it('should support single section with label', () => {
    const sections: ModalSection[] = [
      {
        label: 'Only Section',
        content: <div>Single content</div>,
      },
    ];

    render(
      <UnifiedModal opened={true} onClose={() => {}} title="Single Section" sections={sections} />
    );

    expect(screen.getByText('Single content')).toBeInTheDocument();
    
    const dividers = screen.getAllByTestId('divider');
    expect(dividers.length).toBe(1);
    expect(dividers[0]).toHaveAttribute('data-label', 'Only Section');
  });

  it('should not render when opened is false', () => {
    render(
      <UnifiedModal opened={false} onClose={() => {}} title="Closed Modal">
        <div>Hidden content</div>
      </UnifiedModal>
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('should maintain backward compatibility with addContentPadding', () => {
    render(
      <UnifiedModal 
        opened={true} 
        onClose={() => {}} 
        title="No Padding Modal"
        addContentPadding={false}
      >
        <div>Content without padding</div>
      </UnifiedModal>
    );

    expect(screen.getByText('Content without padding')).toBeInTheDocument();
  });

  it('should respect addContentPadding with sections', () => {
    const sections: ModalSection[] = [
      {
        label: 'Section 1',
        content: <div>Content 1</div>,
      },
      {
        label: 'Section 2',
        content: <div>Content 2</div>,
      },
    ];

    render(
      <UnifiedModal 
        opened={true} 
        onClose={() => {}} 
        title="Sections No Padding"
        sections={sections}
        addContentPadding={false}
      />
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    // With addContentPadding=false, sections should not be wrapped in Stack
    expect(screen.queryByTestId('stack')).not.toBeInTheDocument();
  });
});
